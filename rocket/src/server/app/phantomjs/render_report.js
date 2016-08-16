/**
 * 此脚本绘画某一页面。
 * casperjs render_report.js --url=http://ddddd --output="file.png"
 */

var casper = require('casper').create({
//	verbose: true,
 //   logLevel: "debug",
	viewportSize:{"width":1024,"height":800}
});

var url = casper.cli.get('url');
var output = casper.cli.get('output');

casper.echo(url);
casper.echo(output);

casper.start(url, function() {
     this.echo(this.getTitle()); // "Google"

     this.wait(3000,function(){
        this.capture(output);
     });
});

casper.run(function() {
    this.exit()
});