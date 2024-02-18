---
template: post
title: 'Raspberry pi temperature monitor using bme280, prometheus and grafana'
slug: raspberry-pi-temperature-monitoring
draft: false
date: 2020-12-05T17:52:01.712Z
description: >-
  Attaching a BME280 sensor to raspberry pi, exposing the data as a http server,
  using prometheus to scrape it and grafana to visualize it 
category: HoPjects
socialImage: ./grafana-temperature.jpg
---
![Grafana](/media/grafana-temperature.jpg)

## What we'll do

Short walk-through for building a home temperature, humidy and pressure sensor by attaching a BME280 sensor to a raspberry pi, using prometheus to build a timeseries for temperature, humidy and pressure and grafana to visualize it in a nice dashboard.  

All the services are running as docker containers using docker-compose.

Running project: [on github](https://github.com/ecyshor/pi-temperature-monitor)

Dashboard snapshot: [snapshot](https://snapshot.raintank.io/dashboard/snapshot/yq6Zq5gh3URdh0LC7p0Wo5l0QGRToEgb)

### The sensor

I've used [this sensor](https://www.amazon.de/-/en/gp/product/B07FS95JXT/ref=ppx_yo_dt_b_asin_title_o01_s00?ie=UTF8&psc=1) but you can use anything you have.

First of all, depending on what you're using you have to make sure the i2c interface is enabled. For me it was just running  `apt install i2c-tools`.

To connect the sensors and be able to use it on the raspberry pi I've followed this [tutorial](https://www.raspberrypi-spy.co.uk/2016/07/using-bme280-i2c-temperature-pressure-sensor-in-python/). The script I'm using is different though, we'll get to that later.

After connecting the sensor check that it's connected using `sudo i2cdetect -y 1`.

### The script

After the sensor is there it's time to read the temperature in a proper way. We plan on using prometheus so the readings have to be in a format which can be understood by prometheus.

In the script I'm using the [bme280 library](https://github.com/rm-hull/bme280) to easily read the sensor output and then manually format it for prometheus.

embed-url-code https://github.com/ecyshor/pi-temperature-monitor/blob/main/read-temp.py python 

#### HTTP output from script

For that I've written a simple http service, [scaap](https://github.com/ecyshor/scaap/) which can be configured to run a script and return the output for each http request. This means each time prometheus scrapes our service it will execute the python script to read the temperature.

The scaap configuration:

 embed-url-code https://github.com/ecyshor/pi-temperature-monitor/blob/main/scaap.toml toml

Required dependencies for the script are installed in the scaap runtime init script:

embed-url-code https://github.com/ecyshor/pi-temperature-monitor/blob/main/init-runtime.sh bash

The scripts runs inside the container so this means that the i2c device has to be mapped into the docker container. For my usecase [this is where I map the device](https://github.com/ecyshor/pi-temperature-monitor/blob/main/docker-compose.yml#L37) 

### Docker setup

This is all we need to be able to configure the docker-compose file

embed-url-code https://github.com/ecyshor/pi-temperature-monitor/blob/main/docker-compose.yml yaml

#### Prometheus config

Prometheus is configured automatically to call the scrip through the http service every 15s:

embed-url-code https://github.com/ecyshor/pi-temperature-monitor/blob/main/prometheus/prometheus.yml yaml

### Access

Once you start everything using `docker-compose up` you can access grafana using `localhost:3000`

The dashboard is not automatically provisioned but you can easily import it using following json

[Go to dashboard json](https://gist.github.com/ecyshor/d97d520fbfb161a9f7c7370528ed9c87) 