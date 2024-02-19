# Intertech-Grafana

This application retrieves data from an Intertech SW-0816 device and publishes it for a Prometheus Server. The Intertech
SW-0816 device transmits data to 'http://ip-of-pdu/status.xml' without user authentication. This app converts this data
and exposes it using the prem-client.

Additionally, we provide a compatible Grafana panel configuration in the Dashboard-Grafana.json file, allowing for
effortless integration and visualization of the data
![img.png](img.png)