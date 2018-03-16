const http =require('http');
const config = require('./config.json');
const path = require('path');
const fs = require('fs');
const mime = require('./modules/mime');
const url = require('url');
const hasTrailingSlash = require('./modules/hasTrailingSlash');

class staticServer {
  constructor(){
    this.port=config.port;
    this.root = config.root;
    this.index=config.root;
  }

  routerHandler (pathName, req ,res){
    fs.stat(pathName, (err, stat) => { // stat 检测是否存在，不存在返回404响应
      if (!err) {
        console.log(pathName);
        const requestPath = url.parse(req.url).pathname;
        console.log(req.url);
        console.log(requestPath);
        if(hasTrailingSlash(requestPath) && stat.isDirectory()){
          this.respondDirectory(pathName, req, res);
        } else if (stat.isDirectory()){
          this.respondRedirect(req, res);
        } else{
          this.respondFile(pathName, req, res);
        }
      } else {
        this.respondNotFound(req, res);
      }
    });
  }

  respondFile(pathName, req, res) {
    const readStream = fs.createReadStream(pathName);
    res.setHeader('Content-Type', mime.lookup(pathName));
    readStream.pipe(res);
  }

  respondDirectory (pathName, req, res){
    const indexPagePath = path.join(pathName, this.index);
    if (fs.existsSync(indexPagePath)) {
      this.respondFile(indexPagePath, req, res);
    } else {
      fs.readdir(pathName, (err, files)=>{
        if (err) {
          res.writeHead(500);
          return res.end(err);
        }
        const requestPath = url.parse(req.url).pathname;

        let content = `<h1> Index of ${requestPath}</h1>`;
        files.forEach(file => {
          let itemLink = path.join(requestPath, file);
          const stat = fs.statSync(path.join(pathName, file));
          if(stat && stat.isDirectory()){
            itemLink =path.join(itemLink,'/');
          }
          content += `<p><a href='${itemLink}'>${file}</a></p>`
        });
        res.writeHead(200,{
          'Content-Type': 'text/html',
        });
        res.end(content);
      })
    } 
  }

  respondRedirect (req, res){
    const location = req.url + '/';
    res.writeHead(301, {
      'Location': location,
      'Content-Type': 'text/html',
    })
    res.end(`Redirect to <a href='${location}'>${location}</a>`)
  }

  respondNotFound(req,res) {
    res.writeHead(404, {
      'Content-Type': 'text/html',
    });
    res.end(`<h1>404 Not Found</h1>`)
  }
  start() {
    http.createServer((req,res)=>{
      const pathName = path.join(this.root,path.normalize(req.url));
      this.routerHandler(pathName,req,res);
    }).listen(this.port, err =>{
      if (err) {
        console.log(err);
        console.info('failed to start server');
      } else {
        console.info(`server started on port : ${this.port}`);
      }
    });
  }
}

module.exports = staticServer;