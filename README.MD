# Legendas.tv SDM (*Subtitle Discover do Monstro*)

A simple way to discover the highlights subtitles of the week from legendas.tv

## Prerequisites

* package `resquest`

```
npm install request
```

## Configuring

In order to download a subtitle, you need to have a valid credential on legendas.tv. Just put your credential on `credential.json` file.

```json
{
    "username": "<username>",
    "password": "<password>"
}
```

Your subtitles will be downloaded in the *subtitles/* folder.