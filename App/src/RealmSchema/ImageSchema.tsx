import Realm from 'realm';

class ImageSchema extends Realm.Object {}
ImageSchema.schema = {
  name: 'Image',
  properties: {
    id: 'string',
    path: 'string',
  },
  primaryKey: 'id',
};

export default ImageSchema;