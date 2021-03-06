import React from 'react'
import { StyleSheet, Text } from 'react-native'
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { ifIphoneX } from 'react-native-iphone-x-helper'

/* Screens */
import { MapScreen } from '../screens/MapScreen'
import { ListNavigation } from '../screens/ListNavigation'
import { SettingsScreen } from '../screens/SettingsScreen'

export const BottomTab = ({navigation}) => {
    const Tab = createMaterialBottomTabNavigator();

    return (
        <Tab.Navigator 
          barStyle={{ 
            backgroundColor: '#fff', 
            height: 70, 
            zIndex: 999, 
            ...ifIphoneX({
                height: 100,
                paddingTop: 10,
            }, {
                height: 70
            }) 
          }}
          initialRouteName="Map"
        >  
          <Tab.Screen 
            name="Map" 
            component={ MapScreen } 
            options={{
              tabBarLabel: '',
              tabBarIcon: () => (
                <Icon name="globe" style={styles.icon} />
              ),
            }}
          />
          <Tab.Screen 
            name="List" 
            component={ ListNavigation } 
            options={{
              tabBarLabel: '',
              tabBarIcon: () => (
                <Icon name="list"  style={styles.icon}/>
              ),
            }}
          />
          <Tab.Screen 
            name="Settings"  
            component={ SettingsScreen } 
            options={{
              tabBarLabel: '',
              tabBarIcon: () => (
                <Icon name="cog"  style={styles.icon}/>
              ),
            }}
          />
        </Tab.Navigator>
    )
}

const styles = StyleSheet.create({
    icon: {  
      color: '#A1A1A1',
      fontSize: 25,
    },
})
