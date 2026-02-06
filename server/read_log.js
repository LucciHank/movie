import fs from 'fs';
try {
    const data = fs.readFileSync('server_log.txt');
    console.log("Log length:", data.length);
    // Try utf16le
    const str = data.toString('utf16le');
    console.log("Content (UTF-16LE):", str.slice(-1000));
} catch (e) {
    console.error(e);
}
