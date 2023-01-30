// console.log('Hello Node!');
// console.log('Goodbye.');

// const os = require('os');
// console.log('type : ' + os.type());

// import { Buffer } from 'buffer';

const bufs = Buffer.from([1, 2, 3, 4]);

for (const buf of bufs) {
console.log(buf);
}
