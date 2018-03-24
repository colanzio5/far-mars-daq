var SerialPort = require('serialport');
var winston = require('winston')
var mqtt = require('mqtt');

//init logging
var winston = require('winston');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.File({ filename: __dirname + '/logs/debug.log', json: false })
  ],
  exceptionHandlers: [
    new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.File({ filename: __dirname + '/logs/exceptions.log', json: false })
  ],
  exitOnError: false
});

// 0 - disconnected, 1 - connected, 2 - refresh?
var mqtt_status = 0;
var mcu_status = 0;

//init mqtt connection
const mqttClient = mqtt.connect('mqtt://192.168.0.36:1883')

//init com port connection
var Readline = SerialPort.parsers.Readline;
var serialPort = new SerialPort('COM3', {
    baudRate: 9600
});
var parser = new Readline();
serialPort.pipe(parser);

serialPort.on('open', () => {
    logger.info("serial port connected!")
    mcu_status = 1;
});

//when connection error occurs do this
serialPort.on('error', () => {
    logger.error("serial port error encountered")
    mcu_status = 2;
    //todo: send status update to client applications
});

//when connection is closed, do this
serialPort.on('close', () => {
    logger.info("serial port has closed");
    mcu_status = 0;
    //todo: send status update to client applications
});

//when data is recieved from com port, do this
parser.on('data', (data) => {
    logger.info("serial port data: " + data);
    parseNewData(data)
        .then((data, topic) => {
            publishDataToClients(data, topic).then(res => {
                logger.info(res);
            });
        }).catch(error => {
            logger.error(error);
        });

    logData(data).catch(error => {
        logger.error(error);
    });
});

mqttClient.on('connect', () => {
    mqtt_status = 1;
    mqttClient.subscribe('SERVER/IN');
    logger.info("connected to mqtt broker");
});

//when data is recieved from mqtt on server/in topic, do this
mqttClient.on('message', (topic, message) => {
    if (topic === 'SERVER/IN') {
        loger.info("new mqtt message: " + message);
        //todo: server commands from server admin client can be called here
    }
});


//-------------END OF MAIN APP EVEN LOOP HANDELING --------------------//
function parseNewData(data) {
    return new Promise((reslve, reject) => {
        try {
            //parse string object into json object
            let json = JSON.parse(data);
            //gets the string value for the first key -> pressure, temperature, imu, valve_states
            topic = Object.keys(json)[0];
            //return topic and data
            resolve(json, topic);
        } catch (error) {
            reject(error);
        }
    });
}

function publishDataToClients(data, topic) {
    return new Promise((resolve, reject) => {
        try {
            let json = JSON.parse(data);
            let mcu_status = json.status;
            let packet_template = {
                ts: new Date(),
                ss: mqtt_status,
            };
            if (json.hasOwnProperty(topic)) {
                packet_template[topic] = json.get(topic);
                mqttClient.publish(topic, packet)
                    .then(mqttQOS => {
                        resolve(mqttQOS);
                    }).catch(error => {
                        reject(error);
                    });
            }
        } catch (error) {
            reject(error);
        }
    });
}

//log data
function logData(data) {
    return new Promise((resolve, reject) => {
        //todo: add logging library
    });
}