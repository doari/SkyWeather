export function processCurrentData(data, locale, setDays) {
    const {
      weather,
      main: { temp, temp_min, temp_max },
      wind: { speed },
      dt,
    } = data;
  
    const date = new Date(dt * 1000).toISOString().split("T")[0];
    const curWeather = {
      [date]: {
        temp: Math.floor(temp),
        temp_min: Math.floor(temp_min),
        temp_max: Math.floor(temp_max),
        wind_speed: speed,
        rainfall: data.rain ? data.rain["1h"] : 0,
        day: new Intl.DateTimeFormat(locale, {
          weekday: "long",
        }).format(dt * 1000),
        md: new Intl.DateTimeFormat(locale, {
          day: "numeric",
          month: "long",
        }).format(dt * 1000),
        desc: weather[0].description,
      },
    };
    setDays(curWeather);
    return curWeather;
  };


  export function processForecastData(data, locale, days, setDays) {
    const dataByDate = new Map();
    const today = new Date(data.list[0].dt * 1000).toISOString().split("T")[0];
  
    for (let i of data.list) {
      const date = new Date(i.dt * 1000).toISOString().split("T")[0];
      const weatherObject = {
        temp: Math.floor(i.main.temp),
        wind_speed: i.wind.speed,
        rainfall: i.rain ? i.rain["3h"] : 0,
        day: new Intl.DateTimeFormat(locale, {
          weekday: "long",
        }).format(i.dt * 1000),
        md: new Intl.DateTimeFormat(locale, {
          day: "numeric",
          month: "long",
        }).format(i.dt * 1000),
        desc: i.weather[0].description,
      };
      dataByDate.set(
        date,
        dataByDate.get(date)
          ? [...dataByDate.get(date), weatherObject]
          : [weatherObject]
      );
    }
};