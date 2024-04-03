const INITIAL_VALUE = 0x0000;
const POLYNOMIAL    = 0xA001;
const XOR_OUTPUT    = 0x0000;

function stringToByteArray(str) {
    return str.split('').map(char => char.charCodeAt(0));
}

function test(data, poly) {
  const crcResult = crc16_IBM_ARC(data);
  const string = new TextDecoder('utf-8').decode(new Uint8Array(data));
    
  console.log('0x' + crcResult.toString(16), '\t', crcResult.toString(2), '\t', string, '\t->', crcResult === poly ? 'passed' : 'failed');
}

function crc16_IBM_ARC(bytes) {
	let register = 0;
	let crc = INITIAL_VALUE;

	for (let byteId = 0; byteId < bytes.length; byteId++) {
		
		register = (crc & 0xFF) ^ bytes[byteId];
		
		for (let j = 0; j < 8; j++) {
			register = (register & 0x1) > 0 ? (register >> 1) ^ POLYNOMIAL : register >> 1;				
		}
		
		crc = (crc >> 8) ^ register;
	}
	
	return crc ^ XOR_OUTPUT;
}


// Check
console.log('HEX ', '\t BIN         ', '\tDATA', '   PASSED');
console.log('______________________________________________');
test(new Int16Array([0x00A3, 0x0057, 0x0011]), 0x1e0e);
test(stringToByteArray('123456789'), 0xbb3d);
test(stringToByteArray('hello mr cat'), 0x6435);
test(stringToByteArray('hello martians!'), 0x0d6a);
test(stringToByteArray('123456789ABCDEF'), 0x1b71);
