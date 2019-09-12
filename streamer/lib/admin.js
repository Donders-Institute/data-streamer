var kue = require('kue');
var utility = require('./utility');
var async = require('async');

/*
    cleanup the complete jobs older than certain days
*/
var _cleanupQueue = function(queue) {

    return function(req, res) {

        var age = req.params['age'];
        var unit = req.params['unit'];

        // convert age in milliseconds
        switch(unit) {
            case 'second':
                age *= 1000;
                break;

            case 'minute':
                age *= 1000 * 60;
                break;

            case 'hour':
                age *= 1000 * 60 * 60;
                break;

            case 'day':
                age *= 1000 * 60 * 60 * 24;
                break;

            case 'week':
                age *= 1000 * 60 * 60 * 24 * 7;
                break;

            case 'month':
                // it's not precisely a month, it's 30 days!!
                age *= 1000 * 60 * 60 * 24 * 30;
                break;

            case 'year':
                // it's not precisely a year, it's 365 days!!
                age *= 100 * 60 * 60 * 24 * 365;
                break;

            default:
                // unknown age unit, return with error
                utility.responseOnError('json', {'errmsg': 'unknown unit for age'}, res);
                break;
        }

        async.waterfall([
            function(wcb) {
                queue.completeCount( function(err, cnt) {
                    if (err) {
                        utility.printErr('Admin:cleanupQueue', err);
                        return wcb(err, 0);
                    }
                    return wcb(null, cnt);
                });
            },
            function(n_complete, wcb) {
                var n_removed = 0;
                kue.Job.rangeByState( 'complete', 0, n_complete, 'asc', function( err, jobs ) {
                    async.everyLimit(jobs, 10, function( j, rcb ) {
                        if ( Date.now() > parseInt(j.updated_at) + age ) {
                            j.remove( function(err) {
                                if ( !err ) n_removed++;
                                // eventual failed removal is ignored
                                return rcb(null, !err);
                            });
                        } else {
                            return rcb(null, true);
                        }
                    }, function(err, rslt) {
                        return wcb(err, n_removed);
                    });
                });
            }
        ], function (err, n_removed) {
            res.json({'errmsg': err, 'n_removed': n_removed});
        });
    }
}

module.exports.cleanupQueue = _cleanupQueue;
