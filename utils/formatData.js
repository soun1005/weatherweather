const dayjs = require('dayjs');

export function formatCurrentData(data, setDays) {
  const {
    weather,
    main: { temp, temp_min, temp_max },
    wind: { speed },
    dt,
  } = data;

  const date = new Date(dt * 1000).toISOString().split('T')[0];
  const curWeather = {
    [date]: {
      temp: Math.floor(temp),
      temp_min: Math.floor(temp_min),
      temp_max: Math.floor(temp_max),
      wind_speed: speed,
      rainfall: data.rain ? data.rain['1h'] : 0,
      // date
      day: dayjs.unix(dt).format('dddd'),
      md: dayjs.unix(dt).format('D MMMM YYYY'),
      // weather description (short ver)
      desc: weather[0].main,
    },
  };
  setDays(curWeather);
  return curWeather;
}

export function formatFivedaysData(data, days, setDays) {
  const dataByDate = new Map();
  const today = new Date(data.list[0].dt * 1000).toISOString().split('T')[0];

  for (let i of data.list) {
    const date = dayjs(i.dt * 1000).format('YYYY-MM-DD');
    const weatherObject = {
      temp: Math.floor(i.main.temp),
      wind_speed: i.wind.speed,
      rainfall: i.rain ? i.rain['3h'] : 0,
      // date
      day: dayjs(i.dt * 1000).format('dddd'),
      md: dayjs(i.dt * 1000).format('D MMMM YYYY'),
      // weather description (short ver)
      desc: i.weather[0].main,
    };
    dataByDate.set(
      date,
      dataByDate.get(date)
        ? [...dataByDate.get(date), weatherObject]
        : [weatherObject]
    );
  }

  dataByDate.forEach((value, key) => {
    if (key === today) {
      let [temp_min, temp_max] = [days[today].temp_min, days[today].temp_max];
      for (i of value) {
        temp_min = Math.min(temp_min, i.temp);
        temp_max = Math.max(temp_max, i.temp);
      }
      setDays((prevDays) => ({
        ...prevDays,
        [today]: {
          ...prevDays[today],
          temp_min: temp_min,
          temp_max: temp_max,
        },
      }));
    } else {
      const valueLength = value.length;
      if (valueLength > 4) {
        let [temp_min, temp_max] = [value[0].temp, value[0].temp];
        const descCounts = {};
        let [temp, wind_speed, rainfall] = [0, 0, 0];
        for (i of value) {
          temp_min = Math.min(temp_min, i.temp);
          temp_max = Math.max(temp_max, i.temp);
          temp += i.temp;
          wind_speed += i.wind_speed;
          rainfall += i.rainfall;
          const desc = i.desc;
          descCounts[desc] = (descCounts[desc] || 0) + 1;
        }

        const sortedDesc = Object.entries(descCounts).sort(
          (a, b) => b[1] - a[1]
        );

        setDays((prevDays) => ({
          ...prevDays,
          [key]: {
            temp: Math.floor(temp / valueLength),
            temp_min: temp_min,
            temp_max: temp_max,
            wind_speed: (wind_speed / valueLength).toFixed(2),
            rainfall: (rainfall / valueLength).toFixed(2),
            day: value[0].day,
            md: value[0].md,
            desc: sortedDesc[0][0],
          },
        }));
      }
    }
  });
}
