/* eslint-env mocha */
/* eslint-disable max-nested-callbacks */

import { expect } from 'aegir/chai'
import { migration } from '../../src/migrations/migration-12/index.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { Key } from 'interface-datastore/key'

/**
 * @typedef {object} DatastoreData
 * @property {string} key
 * @property {string} value
 */

/** @type {DatastoreData[]} */
const migratedPeers = [
  { key: '/peers/bafzbeihho5x3vk5bujrcindezq3vjnfk4yoavps4va34ceo4imojwb3aa4', value: '0a0c0a08047f00000106a8ae10010a0c0a0804d3e691fc06a8ae1001120e2f697066732f69642f312e302e3012132f697066732f69642f707573682f312e302e30120f2f697066732f6b61642f312e302e3012102f697066732f70696e672f312e302e3012152f6c69627032702f6175746f6e61742f312e302e30121b2f6c69627032702f636972637569742f72656c61792f302e312e3012132f7032702f69642f64656c74612f312e302e30120c2f73627074702f312e302e30120b2f736673742f312e302e301a250a0c4167656e7456657273696f6e1215676f2d697066732f302e382e302f343866393465321a1d0a0f50726f746f636f6c56657273696f6e120a697066732f302e312e3022ab02080012a60230820122300d06092a864886f70d01010105000382010f003082010a0282010100b7e451e5da240ea1181707697ad4052b035ebabab1145bd619b9ad9d0018df0a185e9d4cb2fb6026f73fe5c3bf7edda419718a1a78e0f0313cdea0f6de6f4b2aaddbbba5765c3cb4bc8c4d340857acd8dbe462db538420e356b5112758027717ec2472f6e2f5ee814920f795d4a44d40d45f79ac055e3ccc031897e866d573d2bf6be0d84bf2899705f507a6bb4e29004800ec21a826d911e3a13c4b664431627082e79f5535afed20c7f227037fdeec65b0932de821071eddf0b32a5668851b3b5551691ddcb06aaf9f27b98fc540cac408a0c8f9921b044e43291d85ca09c5cd05419fadbbbb097cedffa45cdf7c8cc72c76ab0f49cac13177ab9572f7fd7f02030100012afd040aab02080012a60230820122300d06092a864886f70d01010105000382010f003082010a0282010100b7e451e5da240ea1181707697ad4052b035ebabab1145bd619b9ad9d0018df0a185e9d4cb2fb6026f73fe5c3bf7edda419718a1a78e0f0313cdea0f6de6f4b2aaddbbba5765c3cb4bc8c4d340857acd8dbe462db538420e356b5112758027717ec2472f6e2f5ee814920f795d4a44d40d45f79ac055e3ccc031897e866d573d2bf6be0d84bf2899705f507a6bb4e29004800ec21a826d911e3a13c4b664431627082e79f5535afed20c7f227037fdeec65b0932de821071eddf0b32a5668851b3b5551691ddcb06aaf9f27b98fc540cac408a0c8f9921b044e43291d85ca09c5cd05419fadbbbb097cedffa45cdf7c8cc72c76ab0f49cac13177ab9572f7fd7f0203010001120203011a460a221220e7776fbaaba1a262243464cc3754b4aae61c0abe5ca837c111dc431c9b076007108095ac9a8c8bd5e5161a0a0a0804d3e691fc06a8ae1a0a0a08047f00000106a8ae2a8002816156091db9311138f5ec92a30899238f5b1457e4116c54ef757774a8ed459ace54cd502cba5c5c12733f0774218a6c6fd01d8775079ae221af8c3921dcbceae820b965473b34b5f290e04c0149a283793f087d75d499f658da84aad96ce2c84c61ef7f3fce277c8fca4c29fd9b43329bc1d7eb3e23a094a005e1f99bb704e6e2e2e13c43eba3057887ac580c41ec603827e515be62a023cbc24a00e6d3cf14bb8afef22dfd1fddfb896c8a8cb589859315510d900a10d8729f6521fea289a095ce4971da1c1a87179d35c4e112372e27d15a1fd17707599d53ed74b9e66fef3c7ee888c9f0f3ae5d7c578d2d59299b58f7d7bdf87d395d26700a8ca42b81fa' },
  { key: '/peers/bafzbeihhpqtnbaaiiwtwlmn3r5kxenbcdlvkgtyhtahmer54kp6242cr2a', value: '0a0c0a08047f000001060fa110000a0c0a0804b9b4df9d060fa110000a0c0a0804b9b4dfaa060fa110000a180a142900000000000000000000000000000001060fa11000' },
  { key: '/peers/bafzbeihiqt2rpqwnkxpqitt6ybwiduno5umrqaaxmvl6lb5sbhrrnedu2i', value: '0a0c0a08047f00000106903510000a0c0a080455f04f030690351000' },
  { key: '/peers/bafzbeihqbhumy7v63ytnhdg3ngaionngdpubywwp66ghryik2iagur3f7e', value: '0a0c0a08047f00000106bfde10010a0c0a0804da665e9406bfde1001120e2f697066732f69642f312e302e3012132f697066732f69642f707573682f312e302e30120f2f697066732f6b61642f312e302e3012102f697066732f70696e672f312e302e3012152f6c69627032702f6175746f6e61742f312e302e30121b2f6c69627032702f636972637569742f72656c61792f302e312e3012132f7032702f69642f64656c74612f312e302e30120c2f73627074702f312e302e30120b2f736673742f322e302e301a250a0c4167656e7456657273696f6e1215676f2d697066732f302e382e302f343866393465321a1d0a0f50726f746f636f6c56657273696f6e120a697066732f302e312e3022ab02080012a60230820122300d06092a864886f70d01010105000382010f003082010a0282010100c0f0e616121315b8ee7c0690c2676cfb6b3c9b4344b6503a577b1053265730aea6c11bd4d1e442db6468454b555f3dc00fe35b06f95edff92edac9cc6854c44cad27c081c83e727ddc09bf6256718ec69abbe3fcff5e7e8a801f6b8007014cad3df649393300b74ff18e0d128aa00da13a57bf37ad0fe84538b06965bc6cd379f3a52ca55aafbadd4d9de289744b43143c9532168a1cce23e9dad79b2882cf11ab01f1d0c50b19796dfd481eb7a63dd475d9f23c2083025d50fcaea45f59df22dac7faa22a17993be906e0f149696bcee1cb32974e56a8901dd6a627a120c3c0f8c1df016ea017e4cd1e2ce60a6ab48799739ccd9d0cfd0cd241aee4c37faed102030100012afd040aab02080012a60230820122300d06092a864886f70d01010105000382010f003082010a0282010100c0f0e616121315b8ee7c0690c2676cfb6b3c9b4344b6503a577b1053265730aea6c11bd4d1e442db6468454b555f3dc00fe35b06f95edff92edac9cc6854c44cad27c081c83e727ddc09bf6256718ec69abbe3fcff5e7e8a801f6b8007014cad3df649393300b74ff18e0d128aa00da13a57bf37ad0fe84538b06965bc6cd379f3a52ca55aafbadd4d9de289744b43143c9532168a1cce23e9dad79b2882cf11ab01f1d0c50b19796dfd481eb7a63dd475d9f23c2083025d50fcaea45f59df22dac7faa22a17993be906e0f149696bcee1cb32974e56a8901dd6a627a120c3c0f8c1df016ea017e4cd1e2ce60a6ab48799739ccd9d0cfd0cd241aee4c37faed10203010001120203011a460a221220f009e8cc7ebede26d38cdb69808735a61be81c5acff78c78e10ad2006a4765f910efc6affcfcabb5e5161a0a0a0804da665e9406bfde1a0a0a08047f00000106bfde2a800224b0de2afc7b7c79071a7330c916feaa658007051ce24dd64ef5e7c2af584c4cd94da4f11c7e5e7bcb58aa2bbe9b8acba85e581df95678e567f2521c14c0dd944d14c7db96afc256c9d2eab17b517824a61eb6bfa8f87249c46eef571ccd489ad02ca6b0d226cbf3065663fe884511f45375076bc1450105266afe5e56823f94dd9a069d1dab97712263f758c9416d9fdf5b831cc5f7f88f726d6541f15c62069a4bdd017c9245062c35d176c2b1fcbe13168dcf36602966f052b44d17e992937fd6c3546a93f8816ce5b117f65a6795d0c22d733f91c392ea7249d2b27052163096e6261e81c56d7d64f2bff196f6022b5404e33377752489395b05949954dc' },
  { key: '/peers/bafzbeihr3r2ikkzwdzl65ammco5vzgfvbhscjgg2ynd4i5rdcjm6yw2hvy', value: '0a0c0a08047f000001060fa110000a0e0a0a047f000001060fa2dd0310000a0f0a0b047f00000191020fa1cc0310000a0c0a08048ac50724060fa110000a0e0a0a048ac50724060fa2dd0310000a0f0a0b048ac5072491020fa1cc0310000a180a142900000000000000000000000000000001060fa110000a1a0a162900000000000000000000000000000001060fa2dd0310000a1b0a17290000000000000000000000000000000191020fa1cc0310000a180a14292604a880080000a100000000004e1001060fa110000a1a0a16292604a880080000a100000000004e1001060fa2dd0310000a1b0a17292604a880080000a100000000004e100191020fa1cc031000' },
  { key: '/peers/bafzbeihrnlu4ohkv2rcz2u76x5wiedmg2cftlyiuzzudbdlptdvgmwwjmm', value: '0a0c0a08046f5a941c0601bb10000a0c0a0804b28407660601bb1000' },
  { key: '/peers/bafzbeihvxlgjmagropbw6tqkzkwdggvjfmiwgjofm25arzuimcxvc76qxa', value: '0a0c0a0804759237fc06909410010a0c0a08047f0000010690941001120e2f697066732f69642f312e302e3012132f697066732f69642f707573682f312e302e30120f2f697066732f6b61642f312e302e3012102f697066732f70696e672f312e302e3012152f6c69627032702f6175746f6e61742f312e302e30121b2f6c69627032702f636972637569742f72656c61792f302e312e3012132f7032702f69642f64656c74612f312e302e30120c2f73627074702f312e302e301a250a0c4167656e7456657273696f6e1215676f2d697066732f302e382e302f343866393465321a1d0a0f50726f746f636f6c56657273696f6e120a697066732f302e312e3022ab02080012a60230820122300d06092a864886f70d01010105000382010f003082010a0282010100a5abee5f90b44525b2ecc4c8d6f455dafe7f0e90e45bdfe5e423568932925699551bc44a04b709f4ccba071ef6122174a0937e8a8a5f940a19d909a3a7b9b1dde7bee761f3cc9f64f4a52818ab2f2da36437b51289a217cac69682dd3d891e920297779d0e269a1741f4bf6ebe86e8a349ec2b39442ca0408f3eb790e0a15f4d23244fa5bde695ab202f488d48f4275b781c1f1181211de0fb729c166bb11ba8e5914a325d5bd33966902a108eb8881081c65220b82af6c96e7620eef89146a655a1968741b3269678778aa40922cbac1c493744cc8057f3b7599dad846b8bf28add2b797cd4dfa8e49eb96c1fd972d4a9a84479f7fd15116a5c6d60f13fcaeb02030100012afd040aab02080012a60230820122300d06092a864886f70d01010105000382010f003082010a0282010100a5abee5f90b44525b2ecc4c8d6f455dafe7f0e90e45bdfe5e423568932925699551bc44a04b709f4ccba071ef6122174a0937e8a8a5f940a19d909a3a7b9b1dde7bee761f3cc9f64f4a52818ab2f2da36437b51289a217cac69682dd3d891e920297779d0e269a1741f4bf6ebe86e8a349ec2b39442ca0408f3eb790e0a15f4d23244fa5bde695ab202f488d48f4275b781c1f1181211de0fb729c166bb11ba8e5914a325d5bd33966902a108eb8881081c65220b82af6c96e7620eef89146a655a1968741b3269678778aa40922cbac1c493744cc8057f3b7599dad846b8bf28add2b797cd4dfa8e49eb96c1fd972d4a9a84479f7fd15116a5c6d60f13fcaeb0203010001120203011a460a221220f5bacc9600d173c36f4e0acaac331aa92b116325c566ba08e68860af517fd0b810f6a4ab91cff9bbe5161a0a0a0804759237fc0690941a0a0a08047f0000010690942a8002a1dfaadc3330c4d3c9399063c79fa433149f642ea5a763c869dd68bb46d3071e44ed4b82823599f2a6ff0c460de2b1caf5a302c01c089a9cde392d825e696ff85e2dc09808ec5dc02b6721ea216594aa2c7a695a4640b991e9bf0df06dd8f393b44a60e68a6a2e5b1b3a4e259c03e9b050084af76dfee8c36e5b280d3c61ab89506c929d76efe09d4d851f7544e18e75f6d1cb3eaa2259d453e0defa0e89047e1b6bbdc2549f9ef21bc7d1313e435f20bdd9faa25fd5801ad3af873151764f9822f4db8566eaa91147b226aafb89abd9de87bdb202019f1a22ed6c46482449bafb3683b430280bb72ca40f18f021c21dde148881ff5cefa7c28806cee99efb19' },
  { key: '/peers/bafzbeihwfzza3ydyne5xibiwhb6aoy3bzenslr42fbu5pqmuxydzxuonbm', value: '0a0c0a08047f000001060fa110000a0c0a08049df559f0060fa110000a180a142900000000000000000000000000000001060fa110000a180a14292604a880040000d00000000020ebe001060fa110000a180a14290064ff9b00000000000000009df559f0060fa11000' },
  { key: '/peers/bafzbeihwudzcftctd3tu62zsb4f6kqbz4ozqkopb2y34qdowkooezcesre', value: '0a0c0a08047f000001060fa110000a0f0a0b047f00000191020fa1cc0310000a0c0a080459e969b8060fa110000a0f0a0b0459e969b891020fa1cc0310000a180a142900000000000000000000000000000001060fa110000a1b0a17290000000000000000000000000000000191020fa1cc0310000a180a14292602ff16000500000001005700000001060fa110000a1b0a17292602ff1600050000000100570000000191020fa1cc031000' },
  { key: '/peers/bafzbeihxtwpulx7e5ey7sxipzmwjie2m42iv72gptpjqb3z3gwa2rjob3y', value: '0a0c0a080401a0abfd06a06610010a0c0a08047f00000106a0661001120e2f697066732f69642f312e302e3012132f697066732f69642f707573682f312e302e30120f2f697066732f6b61642f312e302e3012102f697066732f70696e672f312e302e3012152f6c69627032702f6175746f6e61742f312e302e30121b2f6c69627032702f636972637569742f72656c61792f302e312e3012132f7032702f69642f64656c74612f312e302e30120c2f73627074702f312e302e30120b2f736673742f322e302e301a250a0c4167656e7456657273696f6e1215676f2d697066732f302e382e302f343866393465321a1d0a0f50726f746f636f6c56657273696f6e120a697066732f302e312e3022ab02080012a60230820122300d06092a864886f70d01010105000382010f003082010a0282010100d27d7b23c408b548353d7b0d99397ff591e6c2fc82d7c568909d2c5f7c6c4e1a4475b8ff28e322313dedf7fbaa83be4cc04fde726674b13e469e5531e1339d56a9574b689243b6637ce7b40249570c821bc656b3a9469cbfce932a37d2ae2b86beab671dd23b84ae65a88b94374853bc56ab27c10e958a2821bec8bac7bcbd27c7e5eccb83cc40f31de8f3a63cccb55056f808b466b2ff3e14b5dd4efae1426b85c41a15db741c687b64af3fa2a7858cb923583d640bfae859d1f1c2259051b544e137861ce5640641cd796a0da9b5b06054f1bd8ff77bd3e3b5fd226b488d5eb7a1a86c409a767dcdff8f6c1363f4f9f5d60aa28bc7ac7f4bb2706c1ae569d502030100012afd040aab02080012a60230820122300d06092a864886f70d01010105000382010f003082010a0282010100d27d7b23c408b548353d7b0d99397ff591e6c2fc82d7c568909d2c5f7c6c4e1a4475b8ff28e322313dedf7fbaa83be4cc04fde726674b13e469e5531e1339d56a9574b689243b6637ce7b40249570c821bc656b3a9469cbfce932a37d2ae2b86beab671dd23b84ae65a88b94374853bc56ab27c10e958a2821bec8bac7bcbd27c7e5eccb83cc40f31de8f3a63cccb55056f808b466b2ff3e14b5dd4efae1426b85c41a15db741c687b64af3fa2a7858cb923583d640bfae859d1f1c2259051b544e137861ce5640641cd796a0da9b5b06054f1bd8ff77bd3e3b5fd226b488d5eb7a1a86c409a767dcdff8f6c1363f4f9f5d60aa28bc7ac7f4bb2706c1ae569d50203010001120203011a460a221220f79d9f45dfe4e931f95d0fcb2c94134ce6915fe8cf9bd300ef3b3581a8a5c1de10d9d49bc99fe4d8e5161a0a0a080401a0abfd06a0661a0a0a08047f00000106a0662a8002cfcc1bda81d61b14ce80ad2cb5903036216fde5092869aea548e3be677d16cac2f424ac21d0dfc7af3459032045eceef089cdbc4ae1f31090eb42a2e197b6d330a24f78ccc1ec90a1f2f5d4a2d4622e31c9a5c76a165397b2eaf6d74c562f430debe50e433b64c8e1d3ce2e3085ed1c18f82c1a80c9f15bbbc270f2ed35ce3b4bdd9233001ad2306ba1fed82d0885a0298589f6bc84fda2c4546a9755fe25800eeaac814cc077a250337e254d783a3b74d5045c8b14ed282c2ac88e6fa8ed6640622b94454de753aca479539243fa2c9899604f8b2ebae9c0b5d29620cf0057bb1b7385ea3cd0cb9a48349ac8a78ff644112e7973fdb756245124860e2a230e6' }
]

/** @type {DatastoreData[]} */
const unmigratedPeers = [
  { key: '/peers/addrs/bafzbeihho5x3vk5bujrcindezq3vjnfk4yoavps4va34ceo4imojwb3aa4', value: '0a0c0a08047f00000106a8ae10010a0c0a0804d3e691fc06a8ae1001128a05088094ac9a8c8bd5e51612fd040aab02080012a60230820122300d06092a864886f70d01010105000382010f003082010a0282010100b7e451e5da240ea1181707697ad4052b035ebabab1145bd619b9ad9d0018df0a185e9d4cb2fb6026f73fe5c3bf7edda419718a1a78e0f0313cdea0f6de6f4b2aaddbbba5765c3cb4bc8c4d340857acd8dbe462db538420e356b5112758027717ec2472f6e2f5ee814920f795d4a44d40d45f79ac055e3ccc031897e866d573d2bf6be0d84bf2899705f507a6bb4e29004800ec21a826d911e3a13c4b664431627082e79f5535afed20c7f227037fdeec65b0932de821071eddf0b32a5668851b3b5551691ddcb06aaf9f27b98fc540cac408a0c8f9921b044e43291d85ca09c5cd05419fadbbbb097cedffa45cdf7c8cc72c76ab0f49cac13177ab9572f7fd7f0203010001120203011a460a221220e7776fbaaba1a262243464cc3754b4aae61c0abe5ca837c111dc431c9b076007108095ac9a8c8bd5e5161a0a0a0804d3e691fc06a8ae1a0a0a08047f00000106a8ae2a8002816156091db9311138f5ec92a30899238f5b1457e4116c54ef757774a8ed459ace54cd502cba5c5c12733f0774218a6c6fd01d8775079ae221af8c3921dcbceae820b965473b34b5f290e04c0149a283793f087d75d499f658da84aad96ce2c84c61ef7f3fce277c8fca4c29fd9b43329bc1d7eb3e23a094a005e1f99bb704e6e2e2e13c43eba3057887ac580c41ec603827e515be62a023cbc24a00e6d3cf14bb8afef22dfd1fddfb896c8a8cb589859315510d900a10d8729f6521fea289a095ce4971da1c1a87179d35c4e112372e27d15a1fd17707599d53ed74b9e66fef3c7ee888c9f0f3ae5d7c578d2d59299b58f7d7bdf87d395d26700a8ca42b81fa' },
  { key: '/peers/addrs/bafzbeihhpqtnbaaiiwtwlmn3r5kxenbcdlvkgtyhtahmer54kp6242cr2a', value: '0a0c0a08047f000001060fa110000a0c0a0804b9b4df9d060fa110000a0c0a0804b9b4dfaa060fa110000a180a142900000000000000000000000000000001060fa11000' },
  { key: '/peers/addrs/bafzbeihiqt2rpqwnkxpqitt6ybwiduno5umrqaaxmvl6lb5sbhrrnedu2i', value: '0a0c0a08047f00000106903510000a0c0a080455f04f030690351000' },
  { key: '/peers/addrs/bafzbeihqbhumy7v63ytnhdg3ngaionngdpubywwp66ghryik2iagur3f7e', value: '0a0c0a08047f00000106bfde10010a0c0a0804da665e9406bfde1001128a050880c6affcfcabb5e51612fd040aab02080012a60230820122300d06092a864886f70d01010105000382010f003082010a0282010100c0f0e616121315b8ee7c0690c2676cfb6b3c9b4344b6503a577b1053265730aea6c11bd4d1e442db6468454b555f3dc00fe35b06f95edff92edac9cc6854c44cad27c081c83e727ddc09bf6256718ec69abbe3fcff5e7e8a801f6b8007014cad3df649393300b74ff18e0d128aa00da13a57bf37ad0fe84538b06965bc6cd379f3a52ca55aafbadd4d9de289744b43143c9532168a1cce23e9dad79b2882cf11ab01f1d0c50b19796dfd481eb7a63dd475d9f23c2083025d50fcaea45f59df22dac7faa22a17993be906e0f149696bcee1cb32974e56a8901dd6a627a120c3c0f8c1df016ea017e4cd1e2ce60a6ab48799739ccd9d0cfd0cd241aee4c37faed10203010001120203011a460a221220f009e8cc7ebede26d38cdb69808735a61be81c5acff78c78e10ad2006a4765f910efc6affcfcabb5e5161a0a0a0804da665e9406bfde1a0a0a08047f00000106bfde2a800224b0de2afc7b7c79071a7330c916feaa658007051ce24dd64ef5e7c2af584c4cd94da4f11c7e5e7bcb58aa2bbe9b8acba85e581df95678e567f2521c14c0dd944d14c7db96afc256c9d2eab17b517824a61eb6bfa8f87249c46eef571ccd489ad02ca6b0d226cbf3065663fe884511f45375076bc1450105266afe5e56823f94dd9a069d1dab97712263f758c9416d9fdf5b831cc5f7f88f726d6541f15c62069a4bdd017c9245062c35d176c2b1fcbe13168dcf36602966f052b44d17e992937fd6c3546a93f8816ce5b117f65a6795d0c22d733f91c392ea7249d2b27052163096e6261e81c56d7d64f2bff196f6022b5404e33377752489395b05949954dc' },
  { key: '/peers/addrs/bafzbeihr3r2ikkzwdzl65ammco5vzgfvbhscjgg2ynd4i5rdcjm6yw2hvy', value: '0a0c0a08047f000001060fa110000a0e0a0a047f000001060fa2dd0310000a0f0a0b047f00000191020fa1cc0310000a0c0a08048ac50724060fa110000a0e0a0a048ac50724060fa2dd0310000a0f0a0b048ac5072491020fa1cc0310000a180a142900000000000000000000000000000001060fa110000a1a0a162900000000000000000000000000000001060fa2dd0310000a1b0a17290000000000000000000000000000000191020fa1cc0310000a180a14292604a880080000a100000000004e1001060fa110000a1a0a16292604a880080000a100000000004e1001060fa2dd0310000a1b0a17292604a880080000a100000000004e100191020fa1cc031000' },
  { key: '/peers/addrs/bafzbeihrnlu4ohkv2rcz2u76x5wiedmg2cftlyiuzzudbdlptdvgmwwjmm', value: '0a0c0a08046f5a941c0601bb10000a0c0a0804b28407660601bb1000' },
  { key: '/peers/addrs/bafzbeihvxlgjmagropbw6tqkzkwdggvjfmiwgjofm25arzuimcxvc76qxa', value: '0a0c0a0804759237fc06909410010a0c0a08047f0000010690941001128a050880a4ab91cff9bbe51612fd040aab02080012a60230820122300d06092a864886f70d01010105000382010f003082010a0282010100a5abee5f90b44525b2ecc4c8d6f455dafe7f0e90e45bdfe5e423568932925699551bc44a04b709f4ccba071ef6122174a0937e8a8a5f940a19d909a3a7b9b1dde7bee761f3cc9f64f4a52818ab2f2da36437b51289a217cac69682dd3d891e920297779d0e269a1741f4bf6ebe86e8a349ec2b39442ca0408f3eb790e0a15f4d23244fa5bde695ab202f488d48f4275b781c1f1181211de0fb729c166bb11ba8e5914a325d5bd33966902a108eb8881081c65220b82af6c96e7620eef89146a655a1968741b3269678778aa40922cbac1c493744cc8057f3b7599dad846b8bf28add2b797cd4dfa8e49eb96c1fd972d4a9a84479f7fd15116a5c6d60f13fcaeb0203010001120203011a460a221220f5bacc9600d173c36f4e0acaac331aa92b116325c566ba08e68860af517fd0b810f6a4ab91cff9bbe5161a0a0a0804759237fc0690941a0a0a08047f0000010690942a8002a1dfaadc3330c4d3c9399063c79fa433149f642ea5a763c869dd68bb46d3071e44ed4b82823599f2a6ff0c460de2b1caf5a302c01c089a9cde392d825e696ff85e2dc09808ec5dc02b6721ea216594aa2c7a695a4640b991e9bf0df06dd8f393b44a60e68a6a2e5b1b3a4e259c03e9b050084af76dfee8c36e5b280d3c61ab89506c929d76efe09d4d851f7544e18e75f6d1cb3eaa2259d453e0defa0e89047e1b6bbdc2549f9ef21bc7d1313e435f20bdd9faa25fd5801ad3af873151764f9822f4db8566eaa91147b226aafb89abd9de87bdb202019f1a22ed6c46482449bafb3683b430280bb72ca40f18f021c21dde148881ff5cefa7c28806cee99efb19' },
  { key: '/peers/addrs/bafzbeihwfzza3ydyne5xibiwhb6aoy3bzenslr42fbu5pqmuxydzxuonbm', value: '0a0c0a08047f000001060fa110000a0c0a08049df559f0060fa110000a180a142900000000000000000000000000000001060fa110000a180a14292604a880040000d00000000020ebe001060fa110000a180a14290064ff9b00000000000000009df559f0060fa11000' },
  { key: '/peers/addrs/bafzbeihwudzcftctd3tu62zsb4f6kqbz4ozqkopb2y34qdowkooezcesre', value: '0a0c0a08047f000001060fa110000a0f0a0b047f00000191020fa1cc0310000a0c0a080459e969b8060fa110000a0f0a0b0459e969b891020fa1cc0310000a180a142900000000000000000000000000000001060fa110000a1b0a17290000000000000000000000000000000191020fa1cc0310000a180a14292602ff16000500000001005700000001060fa110000a1b0a17292602ff1600050000000100570000000191020fa1cc031000' },
  { key: '/peers/addrs/bafzbeihxtwpulx7e5ey7sxipzmwjie2m42iv72gptpjqb3z3gwa2rjob3y', value: '0a0c0a080401a0abfd06a06610010a0c0a08047f00000106a0661001128a050880d49bc99fe4d8e51612fd040aab02080012a60230820122300d06092a864886f70d01010105000382010f003082010a0282010100d27d7b23c408b548353d7b0d99397ff591e6c2fc82d7c568909d2c5f7c6c4e1a4475b8ff28e322313dedf7fbaa83be4cc04fde726674b13e469e5531e1339d56a9574b689243b6637ce7b40249570c821bc656b3a9469cbfce932a37d2ae2b86beab671dd23b84ae65a88b94374853bc56ab27c10e958a2821bec8bac7bcbd27c7e5eccb83cc40f31de8f3a63cccb55056f808b466b2ff3e14b5dd4efae1426b85c41a15db741c687b64af3fa2a7858cb923583d640bfae859d1f1c2259051b544e137861ce5640641cd796a0da9b5b06054f1bd8ff77bd3e3b5fd226b488d5eb7a1a86c409a767dcdff8f6c1363f4f9f5d60aa28bc7ac7f4bb2706c1ae569d50203010001120203011a460a221220f79d9f45dfe4e931f95d0fcb2c94134ce6915fe8cf9bd300ef3b3581a8a5c1de10d9d49bc99fe4d8e5161a0a0a080401a0abfd06a0661a0a0a08047f00000106a0662a8002cfcc1bda81d61b14ce80ad2cb5903036216fde5092869aea548e3be677d16cac2f424ac21d0dfc7af3459032045eceef089cdbc4ae1f31090eb42a2e197b6d330a24f78ccc1ec90a1f2f5d4a2d4622e31c9a5c76a165397b2eaf6d74c562f430debe50e433b64c8e1d3ce2e3085ed1c18f82c1a80c9f15bbbc270f2ed35ce3b4bdd9233001ad2306ba1fed82d0885a0298589f6bc84fda2c4546a9755fe25800eeaac814cc077a250337e254d783a3b74d5045c8b14ed282c2ac88e6fa8ed6640622b94454de753aca479539243fa2c9899604f8b2ebae9c0b5d29620cf0057bb1b7385ea3cd0cb9a48349ac8a78ff644112e7973fdb756245124860e2a230e6' },
  { key: '/peers/keys/bafzbeihho5x3vk5bujrcindezq3vjnfk4yoavps4va34ceo4imojwb3aa4', value: '080012a60230820122300d06092a864886f70d01010105000382010f003082010a0282010100b7e451e5da240ea1181707697ad4052b035ebabab1145bd619b9ad9d0018df0a185e9d4cb2fb6026f73fe5c3bf7edda419718a1a78e0f0313cdea0f6de6f4b2aaddbbba5765c3cb4bc8c4d340857acd8dbe462db538420e356b5112758027717ec2472f6e2f5ee814920f795d4a44d40d45f79ac055e3ccc031897e866d573d2bf6be0d84bf2899705f507a6bb4e29004800ec21a826d911e3a13c4b664431627082e79f5535afed20c7f227037fdeec65b0932de821071eddf0b32a5668851b3b5551691ddcb06aaf9f27b98fc540cac408a0c8f9921b044e43291d85ca09c5cd05419fadbbbb097cedffa45cdf7c8cc72c76ab0f49cac13177ab9572f7fd7f0203010001' },
  { key: '/peers/keys/bafzbeihqbhumy7v63ytnhdg3ngaionngdpubywwp66ghryik2iagur3f7e', value: '080012a60230820122300d06092a864886f70d01010105000382010f003082010a0282010100c0f0e616121315b8ee7c0690c2676cfb6b3c9b4344b6503a577b1053265730aea6c11bd4d1e442db6468454b555f3dc00fe35b06f95edff92edac9cc6854c44cad27c081c83e727ddc09bf6256718ec69abbe3fcff5e7e8a801f6b8007014cad3df649393300b74ff18e0d128aa00da13a57bf37ad0fe84538b06965bc6cd379f3a52ca55aafbadd4d9de289744b43143c9532168a1cce23e9dad79b2882cf11ab01f1d0c50b19796dfd481eb7a63dd475d9f23c2083025d50fcaea45f59df22dac7faa22a17993be906e0f149696bcee1cb32974e56a8901dd6a627a120c3c0f8c1df016ea017e4cd1e2ce60a6ab48799739ccd9d0cfd0cd241aee4c37faed10203010001' },
  { key: '/peers/keys/bafzbeihvxlgjmagropbw6tqkzkwdggvjfmiwgjofm25arzuimcxvc76qxa', value: '080012a60230820122300d06092a864886f70d01010105000382010f003082010a0282010100a5abee5f90b44525b2ecc4c8d6f455dafe7f0e90e45bdfe5e423568932925699551bc44a04b709f4ccba071ef6122174a0937e8a8a5f940a19d909a3a7b9b1dde7bee761f3cc9f64f4a52818ab2f2da36437b51289a217cac69682dd3d891e920297779d0e269a1741f4bf6ebe86e8a349ec2b39442ca0408f3eb790e0a15f4d23244fa5bde695ab202f488d48f4275b781c1f1181211de0fb729c166bb11ba8e5914a325d5bd33966902a108eb8881081c65220b82af6c96e7620eef89146a655a1968741b3269678778aa40922cbac1c493744cc8057f3b7599dad846b8bf28add2b797cd4dfa8e49eb96c1fd972d4a9a84479f7fd15116a5c6d60f13fcaeb0203010001' },
  { key: '/peers/keys/bafzbeihxtwpulx7e5ey7sxipzmwjie2m42iv72gptpjqb3z3gwa2rjob3y', value: '080012a60230820122300d06092a864886f70d01010105000382010f003082010a0282010100d27d7b23c408b548353d7b0d99397ff591e6c2fc82d7c568909d2c5f7c6c4e1a4475b8ff28e322313dedf7fbaa83be4cc04fde726674b13e469e5531e1339d56a9574b689243b6637ce7b40249570c821bc656b3a9469cbfce932a37d2ae2b86beab671dd23b84ae65a88b94374853bc56ab27c10e958a2821bec8bac7bcbd27c7e5eccb83cc40f31de8f3a63cccb55056f808b466b2ff3e14b5dd4efae1426b85c41a15db741c687b64af3fa2a7858cb923583d640bfae859d1f1c2259051b544e137861ce5640641cd796a0da9b5b06054f1bd8ff77bd3e3b5fd226b488d5eb7a1a86c409a767dcdff8f6c1363f4f9f5d60aa28bc7ac7f4bb2706c1ae569d50203010001' },
  { key: '/peers/metadata/bafzbeihho5x3vk5bujrcindezq3vjnfk4yoavps4va34ceo4imojwb3aa4/AgentVersion', value: '676f2d697066732f302e382e302f34386639346532' },
  { key: '/peers/metadata/bafzbeihho5x3vk5bujrcindezq3vjnfk4yoavps4va34ceo4imojwb3aa4/ProtocolVersion', value: '697066732f302e312e30' },
  { key: '/peers/metadata/bafzbeihqbhumy7v63ytnhdg3ngaionngdpubywwp66ghryik2iagur3f7e/AgentVersion', value: '676f2d697066732f302e382e302f34386639346532' },
  { key: '/peers/metadata/bafzbeihqbhumy7v63ytnhdg3ngaionngdpubywwp66ghryik2iagur3f7e/ProtocolVersion', value: '697066732f302e312e30' },
  { key: '/peers/metadata/bafzbeihvxlgjmagropbw6tqkzkwdggvjfmiwgjofm25arzuimcxvc76qxa/AgentVersion', value: '676f2d697066732f302e382e302f34386639346532' },
  { key: '/peers/metadata/bafzbeihvxlgjmagropbw6tqkzkwdggvjfmiwgjofm25arzuimcxvc76qxa/ProtocolVersion', value: '697066732f302e312e30' },
  { key: '/peers/metadata/bafzbeihxtwpulx7e5ey7sxipzmwjie2m42iv72gptpjqb3z3gwa2rjob3y/AgentVersion', value: '676f2d697066732f302e382e302f34386639346532' },
  { key: '/peers/metadata/bafzbeihxtwpulx7e5ey7sxipzmwjie2m42iv72gptpjqb3z3gwa2rjob3y/ProtocolVersion', value: '697066732f302e312e30' },
  { key: '/peers/protos/bafzbeihho5x3vk5bujrcindezq3vjnfk4yoavps4va34ceo4imojwb3aa4', value: '0a0e2f697066732f69642f312e302e300a132f697066732f69642f707573682f312e302e300a0f2f697066732f6b61642f312e302e300a102f697066732f70696e672f312e302e300a152f6c69627032702f6175746f6e61742f312e302e300a1b2f6c69627032702f636972637569742f72656c61792f302e312e300a132f7032702f69642f64656c74612f312e302e300a0c2f73627074702f312e302e300a0b2f736673742f312e302e30' },
  { key: '/peers/protos/bafzbeihqbhumy7v63ytnhdg3ngaionngdpubywwp66ghryik2iagur3f7e', value: '0a0e2f697066732f69642f312e302e300a132f697066732f69642f707573682f312e302e300a0f2f697066732f6b61642f312e302e300a102f697066732f70696e672f312e302e300a152f6c69627032702f6175746f6e61742f312e302e300a1b2f6c69627032702f636972637569742f72656c61792f302e312e300a132f7032702f69642f64656c74612f312e302e300a0c2f73627074702f312e302e300a0b2f736673742f322e302e30' },
  { key: '/peers/protos/bafzbeihvxlgjmagropbw6tqkzkwdggvjfmiwgjofm25arzuimcxvc76qxa', value: '0a0e2f697066732f69642f312e302e300a132f697066732f69642f707573682f312e302e300a0f2f697066732f6b61642f312e302e300a102f697066732f70696e672f312e302e300a152f6c69627032702f6175746f6e61742f312e302e300a1b2f6c69627032702f636972637569742f72656c61792f302e312e300a132f7032702f69642f64656c74612f312e302e300a0c2f73627074702f312e302e30' },
  { key: '/peers/protos/bafzbeihxtwpulx7e5ey7sxipzmwjie2m42iv72gptpjqb3z3gwa2rjob3y', value: '0a0e2f697066732f69642f312e302e300a132f697066732f69642f707573682f312e302e300a0f2f697066732f6b61642f312e302e300a102f697066732f70696e672f312e302e300a152f6c69627032702f6175746f6e61742f312e302e300a1b2f6c69627032702f636972637569742f72656c61792f302e312e300a132f7032702f69642f64656c74612f312e302e300a0c2f73627074702f312e302e300a0b2f736673742f322e302e30' }
]

/**
 * @param {import('../types').SetupFunction} setup
 * @param {import('../types').CleanupFunction} cleanup
 */
export function test (setup, cleanup) {
  describe('migration 12', function () {
    this.timeout(1024 * 1000)
    /** @type {string} */
    let dir
    /** @type {import('../../src/types').Backends} */
    let backends

    beforeEach(async () => {
      ({ dir, backends } = await setup())
    })

    afterEach(async () => {
      await cleanup(dir)
    })

    describe('forwards', () => {
      beforeEach(async () => {
        await backends.datastore.open()

        for (const { key, value } of unmigratedPeers) {
          await backends.datastore.put(new Key(key), uint8ArrayFromString(value, 'hex'))
        }

        await backends.datastore.close()
      })

      it('should migrate peerstore forward', async () => {
        await migration.migrate(backends, () => {})

        await backends.datastore.open()

        /** @type {DatastoreData[]} */
        const data = []

        for await (const { key, value } of backends.datastore.query({
          prefix: '/peers'
        })) {
          data.push({ key: key.toString(), value: uint8ArrayToString(value, 'hex') })
        }

        await backends.datastore.close()

        expect(data.sort((a, b) => a.key.localeCompare(b.key))).to.deep.equal(migratedPeers.sort((a, b) => a.key.localeCompare(b.key)))
      })
    })

    describe('backwards', () => {
      beforeEach(async () => {
        await backends.datastore.open()

        for (const { key, value } of migratedPeers) {
          await backends.datastore.put(new Key(key), uint8ArrayFromString(value, 'hex'))
        }

        await backends.datastore.close()
      })

      it('should migrate peerstore backward', async () => {
        await migration.revert(backends, () => {})

        await backends.root.open()
        await backends.datastore.open()

        /** @type {DatastoreData[]} */
        const data = []

        for await (const { key, value } of backends.datastore.query({
          prefix: '/peers'
        })) {
          data.push({ key: key.toString(), value: uint8ArrayToString(value, 'hex') })
        }

        await backends.datastore.close()

        expect(data.sort((a, b) => a.key.localeCompare(b.key))).to.deep.equal(unmigratedPeers.sort((a, b) => a.key.localeCompare(b.key)))
      })
    })
  })
}
