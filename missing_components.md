# Missing Components List

Parts still needed to turn the current component list into a fully functional fitness tracker. Prices are rough single-unit estimates (USD) and **have not been verified**, so check current pricing and stock on DigiKey/Mouser before ordering. Alternatives are listed where more than one part could work.

| Component | Model / Pricing | Features |
|-----------|-----------------|----------|
| Optical sensor (LEDs + photodiode) | OSRAM SFH 7072 or similar (~$3-5 USD) | • Green LED for heart rate • Red + IR LEDs for SpO2 • Integrated photodiode, pairs with the MAX86141 front end |
| Optical window / lens | Custom glass or polycarbonate window (~$2-5 USD) | • Protects the sensor • Needs light-blocking barrier between LEDs and photodiode |
| 6-axis IMU (gyro + accel) | LSM6DSV16X (~$4-5 USD) | • Adds gyroscope for workout recognition • Built-in sensor fusion • Could replace the LIS2DUX12 |
| Skin temperature sensor | STTS22H (~$1 USD) | • ±0.5 °C accuracy • Ultra-low power • Tiny package |
| Barometer (optional) | LPS22DF (~$1.50-2 USD) | • Floors climbed / elevation • Low power • Same ST ecosystem |
| Fuel gauge | STC3115 (~$1.50 USD) | • Accurate battery percentage • I2C interface • Low quiescent current |
| Battery protection | DW01A + FS8205A (~$0.30 USD) | • Over-charge, over-discharge and short-circuit protection • Skip if the battery has a built-in protection circuit |
| Voltage regulators | LDK120 LDO (~$0.40 USD) • TPS62743 buck (~$1 USD) | • 1.8 V and 3.3 V rails • Low quiescent current • Buck for efficiency, LDO for the quiet analog rail |
| Charging connector | USB-C receptacle (~$0.60 USD) or 4-pin pogo connector (~$1-2 USD) | • USB-C for convenience • Pogo pins for a smaller, waterproof design |
| ESD protection | USBLC6-2SC6 (~$0.40 USD) | • Protects the charging port • Low capacitance |
| User button | Alps SKRPABE010 tactile switch (~$0.30 USD) | • Wake / select input • Tiny footprint |
| Haptic driver | DRV2605L (~$1.50 USD) | • I2C control • Built-in effects library • Works with ERM or LRA motors |
| Haptic motor | Flat 8 mm LRA or 6 mm coin ERM (~$1-2 USD) | • Vibration alerts • LRA is quieter and more efficient |
| Crystals | 32.768 kHz (~$0.40 USD) • 32 MHz (~$0.50 USD) | • RTC and low-power sleep timing • Main clock if the MCU or radio needs an external one |
| Antenna (if module lacks one) | Johanson 2450AT18A100E chip antenna (~$0.80 USD) | • 2.4 GHz BLE • Needs keep-out area away from battery and metal |
| Debug header | Tag-Connect TC2030-NL (cable ~$40 USD one-time, footprint free) | • SWD programming and debugging • No connector on the board |
| Passives and misc. | Decoupling caps, resistors, inductors, test points (~$4-5 USD) | • Required for every IC above • Adds board area |
| Battery (price check) | 401522-size LiPo, 180 mAh (~$4-8 USD) | • The $135 in the original list is likely a typo or wrong listing • Flexible cells cost more but not that much |
| Enclosure + strap | 3D-printed prototype case (~$10-30 USD) • Silicone strap (~$5-10 USD) | • Water resistance is a design problem on its own • Strap must press the sensor against skin evenly |

## Software / non-hardware items

| Item | Cost | Notes |
|------|------|-------|
| HR / SpO2 algorithms | Free to build, or license | • Motion-artifact cancellation using the accelerometer is the hard part • Maxim/Analog Devices provides reference algorithms for their parts |
| Firmware (BLE, UI, power management, logging) | Free | • Largest time cost of the project |
| Companion app | Apple Developer $99/yr • Google Play $25 one-time | • Or use a generic BLE app / CSV export while prototyping |
| Certification (FCC/CE, battery safety) | Typically thousands of USD | • Only needed if you sell it • Be careful with SpO2 health claims |

## Rough total

Hardware components listed above come to roughly **$25-35 USD** at low volume, not counting the debug cable, enclosure, or certification.
