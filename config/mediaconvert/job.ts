export const job = {
  "Queue": "arn:aws:mediaconvert:ap-southeast-1:052435670811:queues/Default",
  "Settings": {
    "OutputGroups": [
      {
        "Name": "DASH ISO",
        "Outputs": [
          {
            "ContainerSettings": {
              "Container": "RAW"
            },
            "VideoDescription": {
              "Width": 540,
              "ScalingBehavior": "DEFAULT",
              "Height": 960,
              "TimecodeInsertion": "DISABLED",
              "AntiAlias": "ENABLED",
              "Sharpness": 50,
              "CodecSettings": {
                "Codec": "FRAME_CAPTURE",
                "FrameCaptureSettings": {
                  "FramerateNumerator": 30,
                  "FramerateDenominator": 88,
                  "MaxCaptures": 1,
                  "Quality": 80
                }
              },
              "DropFrameTimecode": "ENABLED",
              "ColorMetadata": "INSERT"
            },
            "Extension": "jpg",
            "NameModifier": "_screenshot"
          },
          {
            "ContainerSettings": {
              "Container": "MP4",
              "Mp4Settings": {
                "CslgAtom": "INCLUDE",
                "CttsVersion": 0,
                "FreeSpaceBox": "EXCLUDE",
                "MoovPlacement": "PROGRESSIVE_DOWNLOAD"
              }
            },
            "VideoDescription": {
              "Width": 540,
              "ScalingBehavior": "DEFAULT",
              "Height": 960,
              "TimecodeInsertion": "DISABLED",
              "AntiAlias": "ENABLED",
              "Sharpness": 100,
              "CodecSettings": {
                "Codec": "H_264",
                "H264Settings": {
                  "InterlaceMode": "PROGRESSIVE",
                  "NumberReferenceFrames": 3,
                  "Syntax": "DEFAULT",
                  "Softness": 0,
                  "GopClosedCadence": 1,
                  "HrdBufferInitialFillPercentage": 90,
                  "GopSize": 2,
                  "Slices": 1,
                  "GopBReference": "ENABLED",
                  "HrdBufferSize": 1600000,
                  "MaxBitrate": 800000,
                  "SlowPal": "DISABLED",
                  "SpatialAdaptiveQuantization": "ENABLED",
                  "TemporalAdaptiveQuantization": "ENABLED",
                  "FlickerAdaptiveQuantization": "DISABLED",
                  "EntropyEncoding": "CABAC",
                  "FramerateControl": "INITIALIZE_FROM_SOURCE",
                  "RateControlMode": "QVBR",
                  "QvbrSettings": {
                    "QvbrQualityLevel": 7,
                    "QvbrQualityLevelFineTune": 0,
                    "MaxAverageBitrate": 600000
                  },
                  "CodecProfile": "MAIN",
                  "Telecine": "NONE",
                  "MinIInterval": 0,
                  "AdaptiveQuantization": "HIGH",
                  "CodecLevel": "AUTO",
                  "FieldEncoding": "PAFF",
                  "SceneChangeDetect": "ENABLED",
                  "QualityTuningLevel": "MULTI_PASS_HQ",
                  "FramerateConversionAlgorithm": "DUPLICATE_DROP",
                  "UnregisteredSeiTimecode": "DISABLED",
                  "GopSizeUnits": "SECONDS",
                  "ParControl": "INITIALIZE_FROM_SOURCE",
                  "NumberBFramesBetweenReferenceFrames": 2,
                  "RepeatPps": "DISABLED",
                  "DynamicSubGop": "ADAPTIVE"
                }
              },
              "AfdSignaling": "NONE",
              "DropFrameTimecode": "ENABLED",
              "RespondToAfd": "NONE",
              "ColorMetadata": "INSERT"
            },
            "AudioDescriptions": [
              {
                "AudioTypeControl": "FOLLOW_INPUT",
                "CodecSettings": {
                  "Codec": "AAC",
                  "AacSettings": {
                    "AudioDescriptionBroadcasterMix": "NORMAL",
                    "Bitrate": 96000,
                    "RateControlMode": "CBR",
                    "CodecProfile": "LC",
                    "CodingMode": "CODING_MODE_2_0",
                    "RawFormat": "NONE",
                    "SampleRate": 48000,
                    "Specification": "MPEG4"
                  }
                },
                "LanguageCodeControl": "FOLLOW_INPUT"
              }
            ],
            "NameModifier": "_low_mp4_800kbps"
          },
          {
            "ContainerSettings": {
              "Container": "MP4",
              "Mp4Settings": {
                "CslgAtom": "INCLUDE",
                "CttsVersion": 0,
                "FreeSpaceBox": "EXCLUDE",
                "MoovPlacement": "PROGRESSIVE_DOWNLOAD"
              }
            },
            "VideoDescription": {
              "Width": 1080,
              "ScalingBehavior": "DEFAULT",
              "Height": 1920,
              "TimecodeInsertion": "DISABLED",
              "AntiAlias": "ENABLED",
              "Sharpness": 100,
              "CodecSettings": {
                "Codec": "H_264",
                "H264Settings": {
                  "InterlaceMode": "PROGRESSIVE",
                  "NumberReferenceFrames": 3,
                  "Syntax": "DEFAULT",
                  "Softness": 0,
                  "GopClosedCadence": 1,
                  "HrdBufferInitialFillPercentage": 90,
                  "GopSize": 2,
                  "Slices": 1,
                  "GopBReference": "ENABLED",
                  "HrdBufferSize": 10000000,
                  "MaxBitrate": 5000000,
                  "SlowPal": "DISABLED",
                  "SpatialAdaptiveQuantization": "ENABLED",
                  "TemporalAdaptiveQuantization": "ENABLED",
                  "FlickerAdaptiveQuantization": "DISABLED",
                  "EntropyEncoding": "CABAC",
                  "FramerateControl": "INITIALIZE_FROM_SOURCE",
                  "RateControlMode": "QVBR",
                  "QvbrSettings": {
                    "QvbrQualityLevel": 9,
                    "QvbrQualityLevelFineTune": 0,
                    "MaxAverageBitrate": 4000000
                  },
                  "CodecProfile": "MAIN",
                  "Telecine": "NONE",
                  "MinIInterval": 0,
                  "AdaptiveQuantization": "HIGH",
                  "CodecLevel": "AUTO",
                  "FieldEncoding": "PAFF",
                  "SceneChangeDetect": "ENABLED",
                  "QualityTuningLevel": "MULTI_PASS_HQ",
                  "FramerateConversionAlgorithm": "DUPLICATE_DROP",
                  "UnregisteredSeiTimecode": "DISABLED",
                  "GopSizeUnits": "SECONDS",
                  "ParControl": "INITIALIZE_FROM_SOURCE",
                  "NumberBFramesBetweenReferenceFrames": 3,
                  "RepeatPps": "DISABLED",
                  "DynamicSubGop": "ADAPTIVE"
                }
              },
              "AfdSignaling": "NONE",
              "DropFrameTimecode": "ENABLED",
              "RespondToAfd": "NONE",
              "ColorMetadata": "INSERT"
            },
            "AudioDescriptions": [
              {
                "AudioTypeControl": "FOLLOW_INPUT",
                "CodecSettings": {
                  "Codec": "AAC",
                  "AacSettings": {
                    "AudioDescriptionBroadcasterMix": "NORMAL",
                    "Bitrate": 96000,
                    "RateControlMode": "CBR",
                    "CodecProfile": "LC",
                    "CodingMode": "CODING_MODE_2_0",
                    "RawFormat": "NONE",
                    "SampleRate": 48000,
                    "Specification": "MPEG4"
                  }
                },
                "LanguageCodeControl": "FOLLOW_INPUT"
              }
            ],
            "NameModifier": "_hd_mp4_4000kbps"
          }
        ],
        "OutputGroupSettings": {
          "Type": "DASH_ISO_GROUP_SETTINGS",
          "DashIsoGroupSettings": {
            "SegmentLength": 30,
            "AdditionalManifests": [
              {
                "ManifestNameModifier": "_$Time$",
                "SelectedOutputs": [
                  "_screenshot",
                  "_low_mp4_800kbps",
                  "_hd_mp4_4000kbps"
                ]
              }
            ],
            "FragmentLength": 2,
            "SegmentControl": "SINGLE_FILE",
            "MpdProfile": "MAIN_PROFILE",
            "HbbtvCompliance": "NONE"
          }
        }
      }
    ],
    "AdAvailOffset": 0,
    "Inputs": [
      {
        "AudioSelectors": {
          "Audio Selector 1": {
            "Offset": 0,
            "DefaultSelection": "DEFAULT",
            "ProgramSelection": 1
          }
        },
        "VideoSelector": {
          "ColorSpace": "FOLLOW",
          "Rotate": "DEGREE_0",
          "AlphaBehavior": "DISCARD"
        },
        "FilterEnable": "AUTO",
        "PsiControl": "USE_PSI",
        "FilterStrength": 0,
        "DeblockFilter": "DISABLED",
        "DenoiseFilter": "DISABLED",
        "TimecodeSource": "ZEROBASED",
        "ImageInserter": {
          "InsertableImages": [
            {
              "ImageX": 40,
              "ImageY": 40,
              "Layer": 10,
              "ImageInserterInput": "s3://newonlyfans/image/BitApp-white.png",
              "Opacity": 50
            }
          ]
        }
      }
    ]
  },
  "Priority": 0,
  "JobTemplate": "newonlyfans-template",
  "Role": "arn:aws:iam::052435670811:role/mediaconvert_role"
}