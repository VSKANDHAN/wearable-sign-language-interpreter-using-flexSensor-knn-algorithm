const SerialPort = require('serialport').SerialPort;
const Readline = require('@serialport/parser-readline').ReadlineParser;
const say = require('say');

// Define the serial port your Arduino is connected to
const port = new SerialPort( {path:"COM3", baudRate: 9600 });

// Parse the data from Arduino
const parser = port.pipe(new Readline({ delimiter: '\n' }));

// Event listener for receiving data from Arduino
parser.on('data', function (data) {
    // Split the data into individual sensor values
    const values = data.split(',');

    // Assuming the values are in the same order as sent from Arduino
    const flex1Value = parseInt(values[0]);
    const flex2Value = parseInt(values[1]);
    const flex3Value = parseInt(values[2]);
    const flex4Value = parseInt(values[3]);
    const flex5Value = parseInt(values[4]);
    const imuValue = parseInt(values[5]);

    console.log(flex1Value+','+flex2Value+','+flex3Value+','+flex4Value+','+flex5Value+",call for the help");
   //  console.log("Flex 1:", flex1Value);
   //  console.log("Flex 2:", flex2Value);
    
   //  console.log("Flex 3:", flex3Value);
   //  console.log("Flex 4:", flex4Value);
    
   //  console.log("Flex 5:", flex5Value);
   //  console.log("IMU:",imuValue);
  
})

   

