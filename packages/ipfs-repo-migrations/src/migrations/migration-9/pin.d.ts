import * as $protobuf from "protobufjs";
/** Namespace ipfs. */
export namespace ipfs {

    /** Namespace pin. */
    namespace pin {

        /** Properties of a Set. */
        interface ISet {

            /** Set version */
            version?: (number|null);

            /** Set fanout */
            fanout?: (number|null);

            /** Set seed */
            seed?: (number|null);
        }

        /** Represents a Set. */
        class Set implements ISet {

            /**
             * Constructs a new Set.
             * @param [p] Properties to set
             */
            constructor(p?: ipfs.pin.ISet);

            /** Set version. */
            public version: number;

            /** Set fanout. */
            public fanout: number;

            /** Set seed. */
            public seed: number;

            /**
             * Encodes the specified Set message. Does not implicitly {@link ipfs.pin.Set.verify|verify} messages.
             * @param m Set message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: ipfs.pin.ISet, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Set message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns Set
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): ipfs.pin.Set;

            /**
             * Creates a Set message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns Set
             */
            public static fromObject(d: { [k: string]: any }): ipfs.pin.Set;

            /**
             * Creates a plain object from a Set message. Also converts values to other types if specified.
             * @param m Set
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(m: ipfs.pin.Set, o?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Set to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }
}
