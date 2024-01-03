import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { formatCurrentData, formatFivedaysData } from './utils/formatData';
import { StatusBar } from 'expo-status-bar';
import { API_KEY } from '@env';

// Dimensions -> size of device
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function App() {
  const [city, setCity] = useState('Loading...');
  const [days, setDays] = useState([]);
  // manage the permission
  const [ok, setOk] = useState(true);

  const getWeather = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();

    if (!granted) {
      setOk(false);
    }

    // to get latitude, longitude
    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 });

    // to get current location
    const location = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: false }
    );
    // console.log('location:', location);
    const cityName = location[0].city;
    setCity(cityName);

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&exclude=alerts`
    )
      .then((resp) => resp.json())
      .then((data) => {
        // console.log(data);
        const updatedDays = formatCurrentData(data, setDays);
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&exclude=alerts`
        )
          .then((resp) => resp.json())
          .then((data) => formatFivedaysData(data, updatedDays, setDays))
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    {
      if (Object.keys(days).length === 0) getWeather();
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* status bar */}
      <StatusBar style="auto"></StatusBar>

      <View style={styles.cityWrap}>
        <Text style={styles.cityName}>{city}</Text>
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        indicatorStyle="white"
        contentContainerStyle={styles.weatherContainer}
      >
        {Object.keys(days).length === 0 ? (
          <View style={styles.weatherWrap}>
            {/* loading spinner */}
            <ActivityIndicator
              color="black"
              size="large"
              style={{ marginTop: 10 }}
            />
          </View>
        ) : (
          Object.keys(days).map((key) => (
            <View key={key}>
              <View style={styles.date}>
                <Text style={styles.day}>{days[key].day}</Text>
                <Text style={styles.md}> {days[key].md}</Text>
              </View>
              <View style={styles.weatherWrap}>
                <View style={styles.tempWrap}>
                  <Text style={styles.temp}>{days[key].temp}</Text>
                  <Text style={styles.unit}>º</Text>
                </View>
                <Text style={styles.description}>{days[key].desc}</Text>
              </View>
              <View style={styles.divider}></View>
              <View style={styles.otherInfoWrap}>
                <View style={styles.minMaxWrap}>
                  <Text>{days[key].temp_max} ºC /</Text>
                  <Text> {days[key].temp_min} ºC</Text>
                </View>
                <Text>Rainfall {days[key].rainfall} mm</Text>
                <Text>Wind {days[key].wind_speed} m/s</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#dc5645',
  },
  cityWrap: {
    flex: 0.4,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  cityName: {
    fontSize: 70,
    fontWeight: 'bold',
  },
  date: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  day: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  md: {
    fontSize: 15,
  },
  weatherWrap: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    width: SCREEN_WIDTH - 60,
  },
  tempWrap: {
    flexDirection: 'row',
  },
  temp: {
    fontSize: 190,
  },
  unit: {
    fontSize: 50,
    marginTop: '15%',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 60,
    marginTop: -50,
    fontWeight: 'bold',
  },
  minMaxWrap: {
    flexDirection: 'row',
  },
  otherInfoWrap: {
    alignItems: 'flex-end',
  },
  divider: {
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    marginVertical: 10,
    width: '30%',
    alignSelf: 'flex-end',
  },
});
