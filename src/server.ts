import { serverConfig } from './config';

function helloword(name: string) {
    console.log(`Hello ${name}`);
}
function helloWorld(name: string) {
    console.log(`Hello ${name}`);
}

console.log(serverConfig.PORT);
helloword('Neel Patel');

helloWorld('Jay Patel');
