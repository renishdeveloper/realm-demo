//#region Imports
import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  PermissionsAndroid,
  Image,
  FlatList,
} from 'react-native';
import Realm from 'realm';
import ImageSchema from './App/src/RealmSchema/ImageSchema';
import ImagePicker from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import RNPermissions from 'react-native-permissions';
import {launchImageLibrary} from 'react-native-image-picker';
//#endregion

const realm = new Realm({schema: [ImageSchema]});

function App(): JSX.Element {
  const [image, setImage] = useState(null);
  const [images, setImages] = useState<[]>([]);

  useEffect(() => {
    const imagesFromStorage = realm.objects('Image');
    setImages(imagesFromStorage);
    requestPermission();
  }, []);

  const requestPermission = async () => {
    try {
      console.log('asking for permission');
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);
      if (
        granted['android.permission.CAMERA'] &&
        granted['android.permission.WRITE_EXTERNAL_STORAGE']
      ) {
        console.log('You can use the camera');
      } else {
        console.log('Camera permission denied');
      }
    } catch (error) {
      console.log('permission error', error);
    }
  };

  const pickImage = async () => {
    // const permission = await RNPermissions.request('photo');
    // if (permission !== 'authorized') {
    //   console.warn('Photo permission denied');
    //   return;
    // }

    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 1024,
        maxHeight: 1024,
      },
      response => {
        if (response.didCancel) {
          console.warn('Image picker cancelled');
        } else if (response.error) {
          console.warn('Image picker error', response.error);
        } else {
          const id = new Date().toISOString();
          const path = `${RNFS.DocumentDirectoryPath}/${id}.jpg`;

          setImage({uri: response?.assets?.[0]?.uri});
          // RNFS.copyFile(response?.assets?.[0]?.uri, path).then(() => {
          realm.write(() => {
            console.log('response', response?.assets?.[0]?.uri);
            realm.create('Image', {id: id, path: response?.assets?.[0]?.uri});
            const images = realm.objects('Image');
            setImages(images);
            console.log('STORED IMAGES', images);
          });
          // });
        }
      },
    );
  };

  const renderImages = ({item}: any) => {
    return (
      <Image source={{uri: item?.path}} style={{width: 100, height: 100}} />
    );
  };
  return (
    <View style={styles.container}>
      <FlatList data={images} renderItem={renderImages} />
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
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  placeholder: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 16,
  },
});

export default App;
