# homebridge-http-loxone-shades

This is a plugin for [homebridge](https://github.com/nfarina/homebridge) which can control window blinds / shades via Loxone.

## Install

Previous installation of [Homebridge](https://github.com/nfarina/homebridge) is required.

Then run the following command to install `homebridge-http-loxone-shades`

```
npm install -g homebridge-http-loxone-shades
```

## Configuration

```json
{
    "accessory": "LoxoneShade",
    "name": "Office Window",
    "pollInterval": 500,
    "statusUrl": "http://localhost/jdev/sps/io/Office%20Windows%20Position/state",
    "targetPositionUrl": "http://localhost/jdev/sps/io/Office%20Windows%20TargetPosition/"
}
```

> You can add as many accessories as needed.

**Example homebridge configuration**


```json
{
    ...
    "accessories": [
        {
            "accessory": "LoxoneShade",
            "name": "Office Window",
            "pollInterval": 500,
            "statusUrl": "http://localhost/jdev/sps/io/Office%20Windows%20Position/state",
            "targetPositionUrl": "http://localhost/jdev/sps/io/Office%20Windows%20TargetPosition/"
        }
    ],
    "platforms": [
        ...
    ]
}
```
