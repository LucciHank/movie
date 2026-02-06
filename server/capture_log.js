import fs from 'fs';
import { spawn } from 'child_process';

console.log("Starting server capture...");
const child = spawn('node', ['index.js'], { shell: true });

let log = '';

child.stdout.on('data', (data) => {
    process.stdout.write(data);
    log += data.toString();
});

child.stderr.on('data', (data) => {
    process.stderr.write(data);
    log += data.toString();
});

child.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
    fs.writeFileSync('server_crash_log.txt', log, 'utf8');
});
