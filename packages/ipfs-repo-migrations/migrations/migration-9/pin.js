/*eslint-disable*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const ipfs = $root.ipfs = (() => {

    /**
     * Namespace ipfs.
     * @exports ipfs
     * @namespace
     */
    const ipfs = {};

    ipfs.pin = (function() {

        /**
         * Namespace pin.
         * @memberof ipfs
         * @namespace
         */
        const pin = {};

        pin.Set = (function() {

            /**
             * Properties of a Set.
             * @memberof ipfs.pin
             * @interface ISet
             * @property {number|null} [version] Set version
             * @property {number|null} [fanout] Set fanout
             * @property {number|null} [seed] Set seed
             */

            /**
             * Constructs a new Set.
             * @memberof ipfs.pin
             * @classdesc Represents a Set.
             * @implements ISet
             * @constructor
             * @param {ipfs.pin.ISet=} [p] Properties to set
             */
            function Set(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            /**
             * Set version.
             * @member {number} version
             * @memberof ipfs.pin.Set
             * @instance
             */
            Set.prototype.version = 0;

            /**
             * Set fanout.
             * @member {number} fanout
             * @memberof ipfs.pin.Set
             * @instance
             */
            Set.prototype.fanout = 0;

            /**
             * Set seed.
             * @member {number} seed
             * @memberof ipfs.pin.Set
             * @instance
             */
            Set.prototype.seed = 0;

            /**
             * Encodes the specified Set message. Does not implicitly {@link ipfs.pin.Set.verify|verify} messages.
             * @function encode
             * @memberof ipfs.pin.Set
             * @static
             * @param {ipfs.pin.ISet} m Set message or plain object to encode
             * @param {$protobuf.Writer} [w] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Set.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.version != null && Object.hasOwnProperty.call(m, "version"))
                    w.uint32(8).uint32(m.version);
                if (m.fanout != null && Object.hasOwnProperty.call(m, "fanout"))
                    w.uint32(16).uint32(m.fanout);
                if (m.seed != null && Object.hasOwnProperty.call(m, "seed"))
                    w.uint32(29).fixed32(m.seed);
                return w;
            };

            /**
             * Decodes a Set message from the specified reader or buffer.
             * @function decode
             * @memberof ipfs.pin.Set
             * @static
             * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
             * @param {number} [l] Message length if known beforehand
             * @returns {ipfs.pin.Set} Set
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Set.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.ipfs.pin.Set();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1:
                        m.version = r.uint32();
                        break;
                    case 2:
                        m.fanout = r.uint32();
                        break;
                    case 3:
                        m.seed = r.fixed32();
                        break;
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            /**
             * Creates a Set message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof ipfs.pin.Set
             * @static
             * @param {Object.<string,*>} d Plain object
             * @returns {ipfs.pin.Set} Set
             */
            Set.fromObject = function fromObject(d) {
                if (d instanceof $root.ipfs.pin.Set)
                    return d;
                var m = new $root.ipfs.pin.Set();
                if (d.version != null) {
                    m.version = d.version >>> 0;
                }
                if (d.fanout != null) {
                    m.fanout = d.fanout >>> 0;
                }
                if (d.seed != null) {
                    m.seed = d.seed >>> 0;
                }
                return m;
            };

            /**
             * Creates a plain object from a Set message. Also converts values to other types if specified.
             * @function toObject
             * @memberof ipfs.pin.Set
             * @static
             * @param {ipfs.pin.Set} m Set
             * @param {$protobuf.IConversionOptions} [o] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Set.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.version = 0;
                    d.fanout = 0;
                    d.seed = 0;
                }
                if (m.version != null && m.hasOwnProperty("version")) {
                    d.version = m.version;
                }
                if (m.fanout != null && m.hasOwnProperty("fanout")) {
                    d.fanout = m.fanout;
                }
                if (m.seed != null && m.hasOwnProperty("seed")) {
                    d.seed = m.seed;
                }
                return d;
            };

            /**
             * Converts this Set to JSON.
             * @function toJSON
             * @memberof ipfs.pin.Set
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Set.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Set;
        })();

        return pin;
    })();

    return ipfs;
})();

export { $root as default };
