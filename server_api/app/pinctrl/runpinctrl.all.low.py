import sys
import gpiod
from time import sleep


# LED_PIN = 19
chip = gpiod.Chip('/dev/gpiochip4')

def setPinLow(pin):
   try:
      led_line = chip.get_line(pin)
      led_line.request(consumer="LED", type=gpiod.LINE_REQ_DIR_OUT)
      led_line.set_value(0)
      print(f"line {pin} was set low ")
   finally:
      led_line.release()


for i, pin in enumerate(sys.argv[1:]):
    setPinLow(int(pin))

