
'use strict';

exports.name = 'watch';
exports.usage = '<cmd> [options]';
exports.desc = 'watch and exec cmd';
exports.register = function(commander){
    var cwd = process.cwd();
    commander
        .option('-r, --root <path>', 'document root', cwd, String)
        .option('--timeout <msec>', 'command exec timeout', 0, parseInt)
        .option('--include <glob>', 'clean include filter', String)
        .option('--exclude <glob>', 'clean exclude filter', String)
        .action(function(){
            var chokidar = require('chokidar');
            var args = Array.prototype.slice.call(arguments);
            var options = args.pop();
            var cmd = args.shift();
            if(!cmd){
                fis.log.error('missing <cmd> argument, using watch <cmd> [options]');
            }
            if(fis.util.exists(options.root)){
                var root = fis.util.realpath(options.root);
                var watcher = chokidar.watch(root, {
                    persistent : true,
                    ignoreInitial : true,
                    ignored : function(path){
                        path = fis.util(path).substring(root.length + 1);
                        var ret = false;
                        if(/(^|\/)\./.test(path)) {
                            ret = true;
                        } else if(fis.util.isFile(root + '/' + path)){
                            ret = !fis.util.filter(path, options.include, options.exclude);
                        }
                        return ret;
                    }
                });
                var onError = function(error){
                    fis.log.warning(error.message || error);
                };
                var running = false;
                var hasTask = 0;
                var exec = require('child_process').exec;
                var run = function(){
                    if(running) {
                        hasTask++;
                    } else {
                        hasTask = 0;
                        running = true;
                        process.stdout.write('\n Ω '.yellow.bold + cmd);
                        var now = Date.now();
                        exec(cmd, {cwd: cwd, timeout: options.timeout || 0}, function(err, stdout, stderr){
                            if(err === null){
                                if(stderr) process.stderr.write('\n - ' + String(stderr).replace(/[\r\n]+$/, '').yellow);
                                if(stdout) process.stdout.write('\n - ' + String(stdout).replace(/[\r\n]+$/, '').grey);
                                process.stdout.write('\n δ '.bold.yellow + String(Date.now() - now).grey + 'ms\n');
                            } else {
                                fis.log.warning(err.message || err);
                            }
                            running = false;
                            if(hasTask) run();
                        });
                    }
                };
                var timer;
                var onChange = function(){
                    clearTimeout(timer);
                    timer = setTimeout(run, 500);
                };
                watcher
                    .on('add', onChange)
                    .on('addDir', onChange)
                    .on('change', onChange)
                    .on('unlink', onChange)
                    .on('unlinkDir', onChange)
                    .on('error', onError)
            } else {
                fis.log.error('invalid document root[' + options.root + ']');
            }
        });
};