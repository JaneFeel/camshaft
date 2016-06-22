'use strict';

var assert = require('assert');

var toposort = require('../../lib/dag/toposort');

var MockNode = require('./dag-mock-node');

describe('dag-toposort', function() {
    it('should not fail for empty nodes', function() {
        // A

        var aNode = new MockNode('A');

        var sorted = toposort(aNode);

        assert.equal(sorted.length, 1);
        assert.equal(sorted[0].id(), 'A');
    });

    it('should work for happy case: two nodes connected', function() {
        // A --> B

        var bNode = new MockNode('B');
        var aNode = new MockNode('A', bNode);

        var sorted = toposort(aNode);

        assert.equal(sorted.length, 2);
        assert.equal(sorted[0].id(), 'B');
        assert.equal(sorted[1].id(), 'A');
    });

    it('should work for triangle', function() {
        // A --> B
        // |     |
        // |     v
        //  ---> C

        var cNode = new MockNode('C');
        var bNode = new MockNode('B', cNode);
        var aNode = new MockNode('A', [bNode, cNode]);

        var sorted = toposort(aNode);

        assert.equal(sorted.length, 3);
        assert.equal(sorted[0].id(), 'C');
        assert.equal(sorted[1].id(), 'B');
        assert.equal(sorted[2].id(), 'A');
    });

    describe('cycles', function() {
        it('should fail for self cycle', function() {
            //  --> A ---
            // |         |
            //  ---------

            var aNode = new MockNode('A');
            var aaNode = new MockNode('A', aNode);
            assert.throws(
                function() {
                    toposort(aaNode);
                },
                function(err) {
                    assert.equal(err.message, 'Cycle at node: ' + JSON.stringify(aaNode));
                    return true;
                }
            );
        });

        it('should fail for basic cycle', function() {
            //  --> A ---
            // |         |
            //  --- B <--

            var bNode = new MockNode('B', new MockNode('A'));
            var aNode = new MockNode('A', bNode);

            assert.throws(
                function() {
                    toposort(aNode);
                },
                function(err) {
                    assert.equal(err.message, 'Cycle at node: ' + JSON.stringify(aNode));
                    return true;
                }
            );
        });

        it('should fail for cycle', function() {
            // A --> B
            // ^     |
            // |     v
            // D <-- C

            var dNode = new MockNode('D', new MockNode('A'));
            var cNode = new MockNode('C', dNode);
            var bNode = new MockNode('B', cNode);
            var aNode = new MockNode('A', bNode);

            assert.throws(
                function() {
                    toposort(aNode);
                },
                function(err) {
                    assert.equal(err.message, 'Cycle at node: ' + JSON.stringify(dNode));
                    return true;
                }
            );
        });
    });

    describe('regressions', function() {
        it('should work for double dep', function() {
            // B --> C
            // ^     ^
            // |     |
            // A --> B

            var aNode = new MockNode('A');
            var b1Node = new MockNode('B', [aNode]);
            var b2Node = new MockNode('B', [aNode]);
            var cNode = new MockNode('C', [b1Node, b2Node]);

            var sorted = toposort(cNode);
            assert.equal(sorted.length, 3);
            assert.equal(sorted[0].id(), 'A');
            assert.equal(sorted[1].id(), 'B');
            assert.equal(sorted[2].id(), 'C');
        });

        it('should work for double dep hiding behind another node', function() {
            // B --------> D
            // ^           ^
            // |           |
            // A --> B --> C

            var aNode = new MockNode('A');
            var b1Node = new MockNode('B', [aNode]);
            var b2Node = new MockNode('B', [aNode]);
            var cNode = new MockNode('C', [b2Node]);
            var dNode = new MockNode('D', [b1Node, cNode]);

            var sorted = toposort(dNode);
            assert.equal(sorted.length, 4);
            assert.equal(sorted[0].id(), 'A');
            assert.equal(sorted[1].id(), 'B');
            assert.equal(sorted[2].id(), 'C');
            assert.equal(sorted[3].id(), 'D');
        });
    });

});
