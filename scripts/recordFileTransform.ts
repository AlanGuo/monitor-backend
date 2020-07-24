import fs, { ReadStream } from "fs";
import path from "path";
 
function streamToString (stream: ReadStream) {
  const chunks: any[] = []
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  })
}



async function readDirSync(dir: string){
	var pa = fs.readdirSync(dir);
	for(let i=0;i<pa.length;i++) {
    const file = pa[i];
    if (!/translated/.test(file)) {
      let result:string = await streamToString(fs.createReadStream(dir+"/"+file)) as string;
      result = result.replace(/livestar\s/g, "");
      fs.writeFileSync(dir+"/"+file+".translated", result);
    }
  }
}

readDirSync(path.resolve(__dirname, "../files"));