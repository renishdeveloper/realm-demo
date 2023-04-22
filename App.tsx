//#region Imports
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,Button,
} from 'react-native';
import Realm from 'realm';
import ImageSchema from './App/src/RealmSchema/ImageSchema';
import ImagePicker from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import RNPermissions from 'react-native-permissions';
//#endregion

function App(): JSX.Element {

  const realm = new Realm({ schema: [ImageSchema] });

  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const permission = await RNPermissions.request('photo');
    // if (permission !== 'authorized') {
    //   console.warn('Photo permission denied');
    //   return;
    // }

    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 1024,
        maxHeight: 1024,
      },
      (response) => {
        if (response.didCancel) {
          console.warn('Image picker cancelled');
        } else if (response.error) {
          console.warn('Image picker error', response.error);
        } else {
          const id = new Date().toISOString();
          const path = `${RNFS.DocumentDirectoryPath}/${id}.jpg`;

          RNFS.copyFile(response.uri, path).then(() => {
            realm.write(() => {
              realm.create('Image', { id, path });
            });
            setImage({ uri: response.uri });
          });
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      {image ? (
        <Image source={image} style={styles.image} />
      ) : (
        <Text style={styles.placeholder}>No image selected</Text>
      )}
      <Button title="Select image" onPress={pickImage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  placeholder: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 16,
  },
});

export default App;
