/**
 * asm-helpers.js
 * A simple helper module for managing memory allocation of
 * collections of objects, particularly for use in asm.js code
 *
 * Copyright (c) 2013 Jasper Palfree <jasper@wellcaffeinated.net>
 * Licensed MIT
 */

(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. 
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals (root is window)
        root.ASMHelpers = factory();
    }
}(this, function () {
    'use strict';

    var ASMHelpers = {};

    ASMHelpers.Types = {
        
        'bool'   : { // uint8
            size: Uint8Array.BYTES_PER_ELEMENT,
            pow: Math.ceil(Math.log(Uint8Array.BYTES_PER_ELEMENT)/Math.LN2),
            view: Uint8Array
        },
        'uint8'  : {
            size: Uint8Array.BYTES_PER_ELEMENT,
            pow: Math.ceil(Math.log(Uint8Array.BYTES_PER_ELEMENT)/Math.LN2),
            view: Uint8Array
        },
        'int8'   : {
            size: Int8Array.BYTES_PER_ELEMENT,
            pow: Math.ceil(Math.log(Int8Array.BYTES_PER_ELEMENT)/Math.LN2),
            view: Int8Array
        },
        'uint16' : {
            size: Int16Array.BYTES_PER_ELEMENT,
            pow: Math.ceil(Math.log(Int16Array.BYTES_PER_ELEMENT)/Math.LN2),
            view: Int16Array
        },
        'int16'  : {
            size: Int16Array.BYTES_PER_ELEMENT,
            pow: Math.ceil(Math.log(Int16Array.BYTES_PER_ELEMENT)/Math.LN2),
            view: Int16Array
        },
        'uint32' : {
            size: Int32Array.BYTES_PER_ELEMENT,
            pow: Math.ceil(Math.log(Int32Array.BYTES_PER_ELEMENT)/Math.LN2),
            view: Int32Array
        },
        'uint'   : { // uint32
            size: Uint32Array.BYTES_PER_ELEMENT,
            pow: Math.ceil(Math.log(Uint32Array.BYTES_PER_ELEMENT)/Math.LN2),
            view: Uint32Array
        },
        'int32'  : {
            size: Int32Array.BYTES_PER_ELEMENT,
            pow: Math.ceil(Math.log(Int32Array.BYTES_PER_ELEMENT)/Math.LN2),
            view: Int32Array
        },
        'int'    : { // int32
            size: Int32Array.BYTES_PER_ELEMENT,
            pow: Math.ceil(Math.log(Int32Array.BYTES_PER_ELEMENT)/Math.LN2),
            view: Int32Array
        },
        'float32': {
            size: Float32Array.BYTES_PER_ELEMENT,
            pow: Math.ceil(Math.log(Float32Array.BYTES_PER_ELEMENT)/Math.LN2),
            view: Float32Array
        },
        'float'  : { // float32
            size: Float32Array.BYTES_PER_ELEMENT,
            pow: Math.ceil(Math.log(Float32Array.BYTES_PER_ELEMENT)/Math.LN2),
            view: Float32Array
        },
        'float64': {
            size: Float64Array.BYTES_PER_ELEMENT,
            pow: Math.ceil(Math.log(Float64Array.BYTES_PER_ELEMENT)/Math.LN2),
            view: Float64Array
        },
        'double' : { // float64
            size: Float64Array.BYTES_PER_ELEMENT,
            pow: Math.ceil(Math.log(Float64Array.BYTES_PER_ELEMENT)/Math.LN2),
            view: Float64Array
        },
    };


    var Struct = function Struct( data, ptr, schema, buffer ){

        var key
            ,props
            ;

        this.setPtr( ptr );
        this.buffer = buffer;

        // setup getters/setters
        for (key in schema){

            props = schema[ key ];
            this.addProp( key, props.ptr, props.type );
        }

        // set data
        for (key in data){

            this[ key ] = data[ key ];
        }
    };

    Struct.prototype = {

        setPtr: function( ptr ){

            this.ptr = ptr;
        },

        getPtr: function(){

            return this.ptr;
        },

        addProp: function( name, ptr, type ){

            var self = this
                ,typeProps = ASMHelpers.Types[ type ]
                ,viewInst = new typeProps.view( self.buffer )
                ,pow = typeProps.pow
                ;

            self.__defineGetter__(name, function(){
                return viewInst[ (self.ptr + ptr) >> pow ];
            });

            self.__defineSetter__(name, function( val ){
                return viewInst[ (self.ptr + ptr) >> pow ] = val;
            });
        }
    };
      
    var Collection = function Collection( schema, options ){

        if (!(this instanceof Collection)){

            return new Collection( schema, options );
        }

        options = options || {};
        
        var key
            ,type
            ,size
            ,objSize = 0
            ,tmp
            ,idx
            ,bufferSize
            ,largest = 0
            ,sc = {}
            ,table = [ {},{},{},{} ] // four hashes to guide the order of memory allocation
            ,maxObjects = options.maxObjects || 1000
            ;
        
        for (key in schema){

            type = schema[ key ];
            
            if (typeof type === 'string'){
                
                type = type.toLowerCase();
                tmp = ASMHelpers.Types[ type ];
                size = tmp.size;

                if (!size){
                    throw 'Type ' + type + ' not supported.';
                }

                // assemble total object size
                objSize += size;
                largest = ( size > largest ) ? size : largest;

                idx = tmp.pow;
                table[ idx ][ key ] = type;
            }
        }

        // round up to the nearest multiple of the largest object size
        objSize = Math.ceil(objSize / largest) * largest;

        this.objSize = objSize;
        this.blockSize = largest;
        // need the largest power of 2 greater than required size
        bufferSize = 1 << Math.ceil(Math.log(objSize * maxObjects)/Math.LN2);
        this.buffer = new ArrayBuffer( bufferSize );
        tmp = 0;

        for ( var i = table.length - 1; i >= 0; i-- ){
            
            for (key in table[ i ]){

                !function(key, type, ptr){

                    var params = ASMHelpers.Types[ type ];

                    sc[ key ] = {
                        ptr: ptr,
                        pow: params.pow,
                        size: params.size,
                        type: type
                    };

                    tmp += params.size;
                }(key, table[ i ][ key ], tmp);
            }
        }

        this._schema = sc;
        this.objs = [];
    };

    Collection.prototype = {
        /**
         * Add a member
         * @param {Object} obj Values to set for the object
         */
        add: function( obj ){

            var ptr = this.objSize * this.objs.length
                ,inst = new Struct( obj, ptr, this._schema, this.buffer )
                ;

            this.objs.push( inst );
        },
        /**
         * Remove one or more members
         * @param  {Number} idx Start index
         * @param  {Number} count (optional) Number of objects to remove beginning at idx
         * @return {void}
         */
        remove: function( idx, count ){

            idx = idx|0;
            count = count|0 || 1;

            if (idx > this.objs.length){
                return;
            }

            // start the view at the selected index
            var objs = this.objs
                ,obj
                ,size = this.objSize
                ,view = new Int8Array( this.buffer, idx * size )
                ;

            // sub array at one object later
            // set the current view to the sub array minus that "first" object
            view.set( view.subarray( count * size ) );
            // repoint objects
            for ( var i = idx + count, l = objs.length; i < l; ++i ){
                
                obj = objs[ i ];
                obj.setPtr( obj.getPtr() - count * size );
            }
            // remove the struct
            objs.splice( idx, count );
        },
        /**
         * Get struct at index
         * @return {Struct}
         */
        at: function( idx ){

            return this.objs[ idx ];
        },
        /**
         * Get number of members
         * @return {Number}
         */
        count: function(){

            return this.objs.length;
        },
        /**
         * Remove all members
         * @return {void}
         */
        clear: function(){

            delete this.objs;
            this.objs = [];
        },
        /**
         * Execute a function for each member
         * @param  {Function} fn
         * @return {void}
         */
        each: function( fn ){

            var objs = this.objs;

            for ( var i = 0, l = objs.length; i < l; ++i ){
                
                fn( objs[ i ], i );
            }
        },
        /**
         * Include an ASM Module
         * @param  {Function} fn ASM module factory
         * @return {void}
         */
        include: function( fn ){

            var self = this
                ,stdlib = { 
                    Uint8Array: Uint8Array,
                    Int8Array: Int8Array,
                    Uint16Array: Uint16Array,
                    Int16Array: Int16Array,
                    Uint32Array: Uint32Array,
                    Int32Array: Int32Array,
                    Float32Array: Float32Array,
                    Float64Array: Float64Array,
                    Math: Math 
                }
                ,coln = {
                    getLen: function(){
                        return self.objs.length;
                    },
                    ptr: self.ptr,
                    objSize: self.objSize
                }
                ,mixin
                ,key
                ;

            for ( key in self._schema ){

                coln[ '$'+key ] = self._schema[ key ].ptr;
            }

            mixin = fn( stdlib, coln, self.buffer );

            for ( key in mixin ){

                self[ key ] = mixin[ key ];
            }
        }
    };

    ASMHelpers.Collection = Collection;

    return ASMHelpers;

}));
