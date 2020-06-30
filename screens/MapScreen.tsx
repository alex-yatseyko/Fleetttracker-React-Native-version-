import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    Alert,
    AsyncStorage,
    TouchableHighlight,
} from 'react-native';
import {
    INFINITE_ANIMATION_ITERATIONS,
    LatLng,
    WebViewLeaflet,
    WebViewLeafletEvents,
    WebviewLeafletMessage,
    AnimationType,
    MapShapeType
  } from "../services/utility/react-native-webview-leaflet/index";

  import Svg, {
    Use,
    Image,
  } from 'react-native-svg';
  import { TouchableWithoutFeedback, TouchableOpacity } from 'react-native-gesture-handler';
  import Icon from 'react-native-vector-icons/FontAwesome';
  import { useHttp } from '../services/utility/http.hook'

  import { ShipScreen } from './ShipScreen'
  import { SettingsScreen } from './SettingsScreen'
  import { ScheduleScreen } from './ScheduleScreen'

  import { createStackNavigator } from '@react-navigation/stack';

  import Globals from '../component-library/Globals';
  import Config from "react-native-config";

  // import { rootReducer } from '../redux/rootReducer'
  import { authReducer } from '../redux/authReducer'

  const axios = require('axios');

  // import BackendApiClient from '../services/api/BackendApiClient';

  type LatLngObject = { lat: number; lng: number };
  
  // Basic Logic: get IDs from api/ships and context (don't forget about second page)
  // Get the positions from api/ships/{id}/latest_postition

  const Stack = createStackNavigator();


  const icon = `<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 640 640" width="40" height="40"><defs><path d="M320.8 7.2L501.6 640L140 640L320.8 7.2Z" id="b1OuTbAhqc"></path></defs><g><g><g><use xlink:href="#b1OuTbAhqc" opacity="1" fill="#fefe02" fill-opacity="1"></use><g><use xlink:href="#b1OuTbAhqc" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="14" stroke-opacity="1"></use></g></g></g></g></svg>`
  const scale = .6;

const getDuration = (): number => Math.floor(Math.random() * 3) + 1;
const getDelay = (): number => Math.floor(Math.random()) * 0.5;
const iterationCount = "infinite";


export const MapScreen = ({navigation}) => {
  return(
      <Stack.Navigator initialRouteName="Map">
        <Stack.Screen 
          name="Map" 
          component={Map} 
          options={{ 
            headerShown: false 
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
        />
        <Stack.Screen 
          name="Ship" 
          component={ShipScreen}
          options={{ 
            title: 'Ship Title',
            headerBackTitleStyle: { 
              color: 'white' 
            },
            headerRight: () => (
                <TouchableWithoutFeedback
                onPress={() => alert('Focus ship on the map')}
                >
                  <Icon name="crosshairs" style={styles.headerIcon} />
                </TouchableWithoutFeedback>
            ), 
          }}
        />
        <Stack.Screen 
          name="Schedule" 
          component={ScheduleScreen}
          options={{ 
            title: 'Schedule Location',
            headerBackTitle: '|',
            headerBackTitleStyle: { 
              color: 'white' 
            },
            headerRight: () => (
              <TouchableWithoutFeedback
               onPress={() => alert('Focus ship on the map')}
              >
                <Icon 
                  name="reply"  
                  style={[styles.headerIcon, {
                    transform: [{ scaleX: -1 }],
                    marginRight: 15
                  }]}
                />
              </TouchableWithoutFeedback>
            ), 
          }}
        />
      </Stack.Navigator>
  )
}

  const Map = ({navigation}) => {
    const [mapCenterPosition, setMapCenterPosition] = useState({
        lat: 40.153238,
        lng: 12.986282
      });
      const [search, setSearch ] = useState([])
      const [ownPosition, setOwnPosition] = useState(null);
      const [webViewLeafletRef, setWebViewLeafletRef] = useState(null);

      const [locations, setLocations] = useState()
      const [filteredLocations, setFilteredLocations] = useState()
      
      const [loading, setLoading] = useState()

      const locationsTest: { icon: string; position: LatLng; name: string }[] = [
        {
          icon: `<div style="margin-top: -20px;">
          <img style='transform: scale(${scale}) rotate(145deg)' src="http://yatseyko.com/wp-content/uploads/2020/04/method-draw-image-2.svg" />
          <div style="text-align: center; margin-top: -24px; background: rgb(255, 255, 255, 0.6)">Lviv</div>
          </div>`,
          position: { lat: 49.841140, lng: 24.026591 },
          name: "Lviv",
        },
        {
          icon: `<div style="margin-top: -20px;"  >
          <img style='transform: scale(${scale}) rotate(75deg)' src="http://yatseyko.com/wp-content/uploads/2020/04/method-draw-image-2.svg" />
          <div style="text-align: center; margin-top: -24px; background: rgb(255, 255, 255, 0.6)">Kyiv</div>
          </div>
          `,
          position: { lat: 50.467313, lng: 30.520483 },
          name: "Kyiv",
        }
    
      ];


    const onMessageReceived = (message: WebviewLeafletMessage) => {
        switch (message.event) {
          case WebViewLeafletEvents.ON_MAP_MARKER_CLICKED:
            // Alert.alert(
              // `Map Marker Touched, ID: ${message.payload.mapMarkerID || "unknown"}`
              navigation.navigate('Ship')
            // );
    
        //     break;
        //   case WebViewLeafletEvents.ON_MAP_TOUCHED:
        //     const position: LatLngObject = message.payload
        //       .touchLatLng as LatLngObject;
        //     Alert.alert(`Map Touched at:`, `${position.lat}, ${position.lng}`);
        //     break;
          default:
            // console.log("App received", message);
        }
      };

      const onFilterList = () => {
        console.log('List is Filtered')
      }

      const hereCredentials = {
        appId: 'T94boxXXrApFtc58WmGz',
        apiKey: 'aJYTveJijLx5bMV5Qt4-pXKHvbH9CblzqBiq3dRZRDA'
      }
      const themes = [
        'normal.day',
        'reduced.night'
      ]
      const hereTileUrl = `https://1.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/${themes[0]}/{z}/{x}/{y}/256/png8?apiKey=${ hereCredentials.apiKey }&app_id=${ hereCredentials.appId }`

      // const onIncrement={() => store.dispatch({ type: 'INCREMENT' })}

      const { error, request } = useHttp()
      
      const getMapData = async () => {
        const token = await AsyncStorage.getItem('Token')
        try {
          const fetched = await request('https://staging.api.app.fleettracker.de/api/ships', 'GET', null, {
            Authorization: `Bearer ${token}`
          })
          

          // Createing arrays to store data
          const fetchedShipIds = []
          const fetchedScheduleIds = []
                    
          // /* Function for getting IDs */
                    const getIds = (item) => {
                      const idKey = item['@id'].slice(11, 15)
                      const scheduleIdKey = item['schedules'][0]['@id'].slice(15, 19)
                      fetchedShipIds.push(idKey)
                      fetchedScheduleIds.push(scheduleIdKey)
                    }
              
                    // Loop for getting ids
                    fetched['hydra:member'].forEach(getIds)
          // console.log(fetchedShipIds) // Ids


          // console.log(fetched['hydra:member'][1]['name']) // Test if name works
          if(fetched) {
            const newObject = [
              {
                "name": fetched['hydra:member'][1]['name'],
                "icon": '',
                "position": '',
              }
            ]
          }
          // fetched ? console.log (fetched['hydra:member']) : null
        } catch(e) {
          console.log(e)
        }
      }

      const getMapDataOld = async () => {
        const token = await AsyncStorage.getItem('Token')
        // console.log('Url', Config.apiUrl)
        try {
          // console.log('token', token)
          const fetched = await request('https://staging.api.app.fleettracker.de/api/ships', 'GET', null, {
            Authorization: `Bearer ${token}`
          })
          console.log('Test', fetched)

          // Createing arrays for saving data
          const fetchedShipIds = []
          const fetchedScheduleIds = []
          
          /* Function for getting IDs */
          const getIds = (item) => {
            const idKey = item['@id'].slice(11, 15)
            const scheduleIdKey = item['schedules'][0]['@id'].slice(15, 19)
            fetchedShipIds.push(idKey)
            fetchedScheduleIds.push(scheduleIdKey)
          }
    
          // Loop for getting ids
          fetched['hydra:member'].forEach(getIds)
          
          console.log('Works')
          
          // Request for all the details
          for(let i = 0; i < fetchedShipIds.length; i++) {
            // console.log(i)
            const _id = fetchedShipIds[i]
            let fetchedCapt = await request(`https://staging.api.app.fleettracker.de/api/ships/${_id}/latest_position`, 'GET', null, {
                Authorization: `Bearer ${token}`
            })
            if(fetchedCapt == null) {
              //   console.log(_id)
              fetchedCapt = ''
            }
            // Adding to the main Fetched details
            fetched['hydra:member'][i]['latest_position'] = fetchedCapt
          }


          let fetchedFuture = []
          for(let j = 0; j < fetchedScheduleIds.length; j++) {
              const _id = fetchedScheduleIds[j]
              try{
                  let fetchedSchedule = await request(`https://staging.api.app.fleettracker.de/api/future_schedule_entries?schedule_id=${_id}`, 'GET', null, {
                      Authorization: `Bearer ${token}`
                  })
                  if(fetchedSchedule === undefined) {
                      console.log('Test')
                  }
                  if(fetchedSchedule['hydra:member'].length === 1){
                      fetchedSchedule = {
                          'hydra:member': [
                              { etd: fetchedSchedule['hydra:member'][0]['eta'], foid: fetchedSchedule['hydra:member'][0]['foid']},
                              { eta: 'No data', etd: 'No data' },
                              { eta: 'No data', etd: 'No data' }
                          ]
                      }
                  }
                  if(fetchedSchedule['hydra:member'].length === 2){                         
                      fetchedSchedule = {
                          'hydra:member': [
                              { etd: fetchedSchedule['hydra:member'][0]['eta'], foid: fetchedSchedule['hydra:member'][0]['foid']},
                              { etd: fetchedSchedule['hydra:member'][1]['eta'], foid: fetchedSchedule['hydra:member'][1]['foid']},
                              { eta: 'No data', etd: 'No data' }
                          ]
                      }
                  }
                  if(fetchedSchedule['hydra:totalItems'] === 0) {
                      fetchedSchedule = {
                          'hydra:member': [
                              { eta: 'No data', etd: 'No data' },
                              { eta: 'No data', etd: 'No data' },
                              { eta: 'No data', etd: 'No data' }
                          ]
                      }
                  }

                  if(fetchedSchedule['hydra:member'][0]['foid']) {
                      let obj1 = await request(`https://staging.api.app.fleettracker.de/api/fixed_objects/${fetchedSchedule['hydra:member'][0]['foid']}`, 'GET', null, {
                          Authorization: `Bearer ${token}`
                      })
                      fetchedSchedule['hydra:member'][0]['countrycode'] = obj1['countrycode']
                      fetchedSchedule['hydra:member'][0]['unlocationcode'] = obj1['unlocationcode']
                  }
                  if(fetchedSchedule['hydra:member'][1]['foid']) {
                      let obj1 = await request(`https://staging.api.app.fleettracker.de/api/fixed_objects/${fetchedSchedule['hydra:member'][1]['foid']}`, 'GET', null, {
                          Authorization: `Bearer ${token}`
                      })
                      fetchedSchedule['hydra:member'][1]['countrycode'] = obj1['countrycode']
                      fetchedSchedule['hydra:member'][1]['unlocationcode'] = obj1['unlocationcode']
                  }
                  if(fetchedSchedule['hydra:member'][2]['foid']) {
                      let obj1 = await request(`https://staging.api.app.fleettracker.de/api/fixed_objects/${fetchedSchedule['hydra:member'][2]['foid']}`, 'GET', null, {
                          Authorization: `Bearer ${token}`
                      })
                      fetchedSchedule['hydra:member'][2]['countrycode'] = obj1['countrycode']
                      fetchedSchedule['hydra:member'][2]['unlocationcode'] = obj1['unlocationcode']
                  }

                  fetchedFuture.push(fetchedSchedule)
                  
              } catch(e) {
                  const fetchedSchedule = {
                      'hydra:member': [
                          { eta: 'No data', etd: 'No data' },
                          { eta: 'No data', etd: 'No data' },
                          { eta: 'No data', etd: 'No data' },
                      ]
                  }
                  fetchedFuture.push(fetchedSchedule)
                  // console.log(e)

                  // localStorage.setItem(storageName, JSON.stringify({
                  //   ships: fetched,
                  //   shipIds: fetchedShipIds,
                  //   scheduleIds: fetchedScheduleIds,
                  // }))

                  // AsyncStorage.setItem('Ships', fetched['hydra:member'])
                  // AsyncStorage.setItem('ShipsIds', JSON.stringify(fetchedShipIds))
                  // AsyncStorage.setItem('ScheduleIds', JSON.stringify(fetchedScheduleIds))

                  setLocations(fetched['hydra:member'])
                  setFilteredLocations(fetched['hydra:member'])
                  setLoading(false)
              }
          }

          for(let k = 0; k < fetched['hydra:member'].length; k++) {
              fetched['hydra:member'][k]['future'] = fetchedFuture[k]
          }         
        } catch(e) {
          console.log(e)
        }
      }

      useEffect(() => {
        getMapData()
      }, [])

      return (
          <View style={{ height: '100%' }}>
              <TouchableHighlight
                style={styles.refresh}
                onPress={() => {
                    getMapData()
                  }
                }
              >
                  <Icon name='refresh' style={styles.refreshIcon} />
              </TouchableHighlight>
              <View style={styles.header}>
                  <TextInput 
                    style={styles.headerInput}
                    textContentType="name"
                    placeholder="Search Vessel or Ship Group..." 
                    onChange={ onFilterList }
                  />
                  <TouchableWithoutFeedback
                    onPress={() => {navigation.navigate('List')}}
                  >
                    <View style={styles.headerButtonWrapper}>
                      <Icon name='bars' style={styles.headerButton} />
                    </View>
                  </TouchableWithoutFeedback>
              </View>
            <WebViewLeaflet
              // ref={(ref: WebViewLeaflet) => {
              //   setWebViewLeafletRef(ref);
              // }}
              onMessageReceived={onMessageReceived}
              mapLayers={[
                {
                  baseLayerName: "HereTileLayer",
                  url: hereTileUrl,
                },
              ]}
              mapMarkers={[
                  ...locationsTest.map(location => {
                    return {
                      id: location.name.replace(" ", "-"),
                      position: location.position,
                      icon: location.icon,
                    };
                  }),
                ]}
              mapCenterPosition={mapCenterPosition}
              zoom={4}
            />  
        </View>
      )
  }
  
  const styles = StyleSheet.create({
    header: {
      position: 'absolute',
      zIndex: 9999999,
      width: '100%',
      marginTop: 50,
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center'
    },
    headerInput: {
      padding: 10,
      borderColor: 'transparent',
      borderRadius: 8,
      margin: 'auto',
      width: '75%',
      backgroundColor: 'white',
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    headerButtonWrapper: {
      marginLeft: 15,
      borderRadius: 8,
      backgroundColor: 'white',
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    headerButton: {
      color: '#A1A1A1',
      fontSize: 22,
      paddingVertical: 7,
      paddingHorizontal: 10,
    },
    refresh: {
      position: 'absolute',
      zIndex: 999,
      backgroundColor: Globals.color.main,
      bottom: 28,
      right: 18,
      paddingHorizontal: 20,
      paddingVertical: 18,
      borderRadius: 60
    },
    refreshIcon: {
      color: 'white',
      fontSize: 25,
    },
    headerIcon: {
      width: 35, 
      fontSize: 23, 
      color: '#4A83B7',
    }
  });