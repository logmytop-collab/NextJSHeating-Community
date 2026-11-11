import sys
import gpiod
from time import sleep


# LED_PIN = 19
chip = gpiod.Chip('/dev/gpiochip4')

def setPinHigh(pin, delay):
   try:
      led_line = chip.get_line(pin)
      led_line.request(consumer="LED", type=gpiod.LINE_REQ_DIR_OUT)
      led_line.set_value(1)
      led_line.release()
      sleep(delay)
      led_line.request(consumer="LED", type=gpiod.LINE_REQ_DIR_OUT)
      led_line.set_value(0)
      print(f"line {pin} was set high for {delay} sec ")
   finally:
      led_line.release()

pin1 = sys.argv[1]
delay = int(sys.argv[2])
setPinHigh(int(pin1), float(delay / 1000))

