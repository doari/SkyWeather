import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { API_KEY } from "@env";
import { processCurrentData, processForecastData } from "./utils/helpers";
import {
  useFonts,
  BlackHanSans_400Regular,
} from "@expo-google-fonts/black-han-sans";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function App() {
  let [fontsLoaded, fontError] = useFonts({
    BlackHanSans_400Regular,
  });

  const [city, setCity] = useState("Loading...");
  const [days, setDays] = useState({});
  const [ok, setOK] = useState(true);

  const now = new Date();
  const locale = "ko-KR"; // Hard-coded한 부분이지만, 이 부분은 원하는 언어 또는 동적으로 설정할 수 있습니다.

  // Date 객체를 언어에 맞게 포맷팅하는 함수
const formatDate = (date, locale) => {
  try {
    // 무효한 날짜 값이 들어오면 'Invalid Date'를 반환합니다.
    if (!(date instanceof Date) || isNaN(date)) {
      throw new Error('Invalid Date');
    }

    return new Intl.DateTimeFormat(locale, {
      weekday: "long",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error.message);
    return 'Invalid Date';
  }
};

  const getWeather = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      setOK(false);
    }
    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });
    const location = await Location.reverseGeocodeAsync(
      {
        latitude,
        longitude,
      },
      { useGoogleMaps: false }
    );
    setCity(location[0].city);

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=kr`
    )
      .then((resp) => resp.json())
      .then((data) => {
        const updatedDays = processCurrentData(data, locale, setDays);
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=kr`
        )
          .then((resp) => resp.json())
          .then((data) =>
            processForecastData(data, locale, updatedDays, setDays)
          )
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (Object.keys(days).length === 0) getWeather();
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  } else {
    return (
      <View style={styles.container}>
        <StatusBar style="light-content" />
        <View style={styles.city}>
          <Text style={styles.cityName}>{city}</Text>
        </View>
        <ScrollView
          horizontal
          pagingEnabled
          indicatorStyle="white"
          contentContainerStyle={styles.weather}
        >
          {Object.keys(days).length === 0 ? (
            <View style={styles.day}>
              <ActivityIndicator
                color="white"
                size="large"
                style={{ marginTop: 10 }}
              />
            </View>
          ) : (
            Object.keys(days).map((key) => (
              <View key={key}>
                <View style={styles.date}>
                  <Text style={styles.dateDay}>
                    {formatDate(new Date(days[key].date), locale)}
                  </Text>
                  <Text style={styles.dateMD}>{days[key].md}</Text>
                </View>
                <View style={styles.horizontalLine}></View>
                <View style={styles.day}>
                  <Text style={styles.temp}>{days[key].temp}</Text>
                  <Text style={styles.description}>{days[key].desc}</Text>
                </View>
                <View style={styles.horizontalLine}></View>
                <View style={styles.otherInfo}>
                  <View>
                    <Text style={{ fontWeight: "bold" }}>
                      {days[key].temp_max} ºC
                    </Text>
                    <Text>{days[key].temp_min} ºC</Text>
                  </View>
                  <View>
                    <Text style={{ fontWeight: "bold" }}>
                      강수량 {days[key].rainfall} mm
                    </Text>
                    <Text>풍속 {days[key].wind_speed} m/s</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: "orange",
  },
  city: {
    flex: 0.3,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    fontSize: 30,
    fontFamily: "BlackHanSans_400Regular",
  },
  date: {
    marginBottom: 20,
  },
  dateDay: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "BlackHanSans_400Regular",
  },
  dateMD: {
    marginTop: 5,
    fontSize: 20,
    fontFamily: "BlackHanSans_400Regular",
  },
  weather: {},
  day: {
    flex: 1,
    alignItems: "left",
    justifyContent: "center",
    width: SCREEN_WIDTH - 60,
  },
  temp: {
    fontSize: 100,
    fontFamily: "BlackHanSans_400Regular",
  },
  description: {
    fontSize: 60,
    fontFamily: "BlackHanSans_400Regular",
  },
  horizontalLine: {
    borderBottomColor: "black",
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  otherInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
});
