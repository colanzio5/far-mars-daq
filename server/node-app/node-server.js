var SerialPort = require('serialport');
var mqtt = require('mqtt');

//init mqtt connection
const mqttClient = mqtt.connect('mqtt://broker.hivemq.com')
//MQTT EVENT LISTENERS
mqttClient.on('connect', () => {
    MQTT_STATUS = 1;
    mqttClient.subscribe('SERVER/IN');
    console.log("Connect to MQTT broker!")
});

mqttClient.on('message', (topic, message) => {
    if(topic === 'SERVER/IN'){
        //todo: server commands from server admin client can be called here
    }
});

//init com port connection
var Readline = SerialPort.parsers.Readline;
var serialPort = new SerialPort('COM3', {
    baudRate: 9600
});
var parser = new Readline();
serialPort.pipe(parser);

// 0 - disconnected, 1 - connected, 2 - refresh?
var MQTT_STATUS = 0;
var MCU_STATUS = 0;

//SERIAL PORT EVENT LISTENERS
//when connection is established, do this
serialPort.on('open', () => {
    console.log('\nCommunication is on!');
    MCU_STATUS = 1;
});

//when connection error occurs do this
serialPort.on('error', () => {
    console.log('\nCRITICAL: COM PORT HAS ENCOUNTERED ERROR!');
    MCU_STATUS = 2;
    //todo: send status update to client applications
});

//when connection is closed, do this
serialPort.on('close', () => {
    console.log('\nCRITICAL: COM PORT HAS DISCONNECTED!');
    MCU_STATUS = 0;
    //todo: send status update to client applications
});

//when data is recieved from com port, do this
parser.on('data', (data) => {
    console.log("\nNew Data: " + data);
    parseCOMData(data)
        .then(parsedData => {

            //do stuff with parsed data
            sendDataToSubscribers(parsedData).catch(err => {
                console.log("PARSE ERROR ENCOUNTERED: " + err);
            });

            logData(parsedData).catch(err => {
                console.log("LOG ERROR ENCOUNTERED: " + err);
            });
        })
        .catch(err => {
            console.log("\nERROR ENCOUNTERED: " + err);
        })
});

//HELPERFUNCTIONS
//parse raw data coming from com port
function parseCOMData(data) {
    return new Promise((resolve, reject) => {
        try {
            let json = JSON.parse(data);
            let date = new Date();
            let MCU_STATUS = json.status;

            if (json.hasOwnProperty('pressure')) {
                resolve({
                    ts: date,
                    p: json.pressure,
                    s: MCU_STATUS
                });
            }
            if (json.hasOwnProperty('temperature')) {
                resolve({
                    ts: date,
                    t: json.temperature,
                    s: MCU_STATUS
                });
            }
        } catch (error) {
            reject(error);
        }
    });
}
//send a parsed data packed to mqtt subscribers
function sendDataToSubscribers(data) {
    return new Promise((resolve, reject) => {
        if (data.hasOwnProperty('p')) {
            //todo: send to pressure topic
        }
        if (data.hasOwnProperty('t')) {
            //todo: send to temperature topic
        }
    });
}
//log data
function logData(data) {
    return new Promise((resolve, reject) => {
        //todo: add logging library
    });
}

function connectToCOMPort() {
    return new Promise()
}