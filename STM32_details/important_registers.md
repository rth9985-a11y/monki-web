## List of important peripheral registers + programming guide
### (See [datasheet] not reference guide for AF table)

DS = Datasheet
RM = Reference Manual

### SPI1 (pg. 94 DS)

| PAD | FUNC | AF VAL (Alternate Function) |
| --- | --- | --- |
| PA1 | SPI1_SCK | AF5 |
| PA2 | SPI_RDY | AF5 |
| PA4 | SPI_NSS | AF5 |
| PA5 | SPI1_SCK | AF5 |
| PA6 | SPI1_MISO | AF5 |
| PA7 | SPI1_MOSI | AF5 |

### Setting alternate functions:
1. Find GPIOx_AFRL register
    - Such that x = the GPIO port
    - In this case cmd+F in document, works fine
    - ADDR offset is 0x20
2. Write the 4-bits from AF table in DS into the associated section in register
    - Ports contain 8 GPIOs each
3. Configure peripheral specifics
