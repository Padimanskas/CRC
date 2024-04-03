/* 
    CRC32 ISO(13239) HDLC algorithm implementation 
    Standard description page: https://www.iso.org/standard/37010.html
	Created by Stanislav Padimanskas
	03/04/2024

 */
 
function computeCRC32(data) {
    // Inital value of CRC
    let crc = 0xFFFFFFFF;

    const polynomial = 0xEDB88320; // This is the reversed polynomial 0x04C11DB7

    // Iterating through each byte of the data array
    for (let i = 0; i < data.length; i++) {
		
        // Perform an XOR with the previously calculated value
        crc ^= data[i];
        
		/*
           Now iterating through each bit of obtained byte
		   The index here is not tied to anything, so we need to perform 8 iterations using any approach you prefer
		   I use 'for' because it's backwards compatible in different hosting environments
		*/
        for (let j = 0; j < 8; j++) {
			/*
				If the current least significant bit is set, then perform XOR operation, which is division by the polynomial
				Here, a one in the least significant bit indicates that the number is even,
				and evenness means that for the current bit position we are at, we can perform modulo 2 division (mod 2)

				>>> - this is the unsigned right shift operator. All numbers in JavaScript are 32-bit signed, meaning with two's complement representation
				and this operator performs a shift without considering the sign bit - the most significant bit (far left) is not copied and the number is not complemented with one

				The expression (crc & 1) can be represented as (crc & 00000000000000000000000000000001)
				
				Integer division modulo 2 (n % 2) is division where the remainder is either 0 or 1
				This way, we check the evenness of a number - if it's even, then
				the remainder is 0, otherwise, the remainder is 1, so we use the bitwise "AND" (&) operation with a mask of 1

				The operation of division mod 2 is usually implemented
				using the bitwise "AND" (&) operation with a mask of 1

				"Logical AND" (&) - this is bitwise multiplication: 0 * 1 gives 0, and 1 * 1 gives 1.
				Thus, by multiplication, we can determine if there is a one
				in the LSB of the CRC number, indicating that it's odd.
				Since in JavaScript 0 is false, and any other number is true,
				the condition has this strange appearance :) if (crc & 1) 
				If crc is an even number, then the condition will trigger

		  

			

			 We conduct the division operation approximately like this
			
			   01101001
			    1001
			   --------
                01000
                 1001
                -------
                 0001010			
			        1001
			     -------
			        0011
			
			 But in reality, the XOR(^) operation looks like this
			 
			   01101001
			   00001001
			   --------
			   01100000
			 

			
			   As becomes clear, the divisor is padded with zeros on the left, which is not good for our algorithm
			   Therefore, we need to constantly shift the dividend one bit to the right until the nearest one in the dividend
			   (align the ones in the higher bits of the dividend and divisor)
			   so that in the resulting number, at least one most significant left digit is always discarded
              			
			   Just in case, here's the XOR truth table so you don't have to google it:

			          0 ^ 0 = 0
			          0 ^ 1 = 1
			          1 ^ 0 = 1
			          1 ^ 1 = 0	
	

    */  
	
			if (crc & 1) {
                crc = (crc >>> 1) ^ polynomial;
            } else {
                crc >>>= 1; // If it's 0, then simply shift until the nearest one
            }
        }
    }

    // Inverting all bits of CRC
    crc = ~crc;
    
	/*
	
		If after inversion the number becomes negative, then convert it to
		two's complement. Adding with the maximum number 0xFFFFFFFF carries
		bits to the end, and ultimately the most significant bit will always be 1,
		and the least significant bit will always be 0, meaning it becomes negative.
		Then complement it with one to remove -0

	
	*/
	if(crc < 0){
		crc = 0xFFFFFFFF + crc + 1; 
	}

    return crc;
}

/*
   Call the function with the data "123"
   The output should be 0x884863d2
*/
const crc32 = computeCRC32(new Int8Array([0x31, 0x32, 0x33])); 
console.log(`0x${crc32.toString(16)}`);
