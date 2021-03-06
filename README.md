# far-mars-daq
Application package for control and data acquisition of the far-mars rocket. Utilizes PyQt and PyQtGraph for data visualization and a MQTT broker for backend services.

## Control Flow
1) MCU Board Reads Data
2) MCU Sends Data Over COM Port
3) Server Reads COM Port Data, Logs Data, Determines Topic
4) Server Sends Read Data to Topic
5) Clients Subscribed to Topic Recieve Data
6) Client Program Displays Data

## MQTT TOPICS
| Topic Name     | Topic Items            | No.   |
|----------------|------------------------|------:|
|DAQ/STATUS      | MCU Status             |0      |
|DAQ/CRITICAL    | Pressure, Valve States |1      |
|DAQ/PERIPHERAL  | IMU, Temperature       |2      |
|SERVER/IN       | Server Commands        |3      |
|SERVER/OUT      | Server Logs            |4      |

# Components
## MCU
- Output: Individial key value pairs formatted in json. IMPORTANT: first key of json must contain raw data key (temperature, pressure, valve_states, imu)
```
{
  'pressure': [0,0,0],
  'timestamp': '1256953732',
  'status': 0
}
```
```
{
  'valve_states': [1,1,0],
  'timestamp': '1256953732',
  'status': 2
}

```
- ToDo: Create definitive schema for all possible key value pairs. Determine key names, and status mode definitions.

## Server
- Python program running on the ACS Raspberry Pi that takes in serial COM port and sends incoming data to the mission control clients through MQTT Broker.
- Determines key and sends data to topic coresponding to key found.
- Data logging takes place here. 
- Integration with ACS digital systems take place here.
- Connect, Disconnect, Refresh COM Port Connection from incoming MQTT connections.

## Client(s)
All clients get data over a MQTT connection. On startup, the client subscribes to it's data topics, and when new data is published to the Server/MQTT Broker, it is automaticall sent to subscribed clients.
### Mission Critical Client
-  Mission Status
- Live Timeseries Chart for Pressure
- Valve State Indicators
- Ignitor State Indicators
### Peripheral Client
- Mission Status
- IMU Data
- Temperature Data?
- Altimeter

### Server Admin Client
- Instantiate or refresh connection to client. 
- Server caught errors and exceptions to this client.
- View Server Logs
- This Client helps us avoid managing the server over an ssh connection. 

