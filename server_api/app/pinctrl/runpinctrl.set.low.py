import sys
import gpiod

# LED_PIN = 19
chip = gpiod.Chip('/dev/gpiochip4')

def setPinLow(pin):
   try:
      led_line = chip.get_line(pin)
      led_line.request(consumer="LED", type=gpiod.LINE_REQ_DIR_OUT)
      led_line.set_value(0)
      print(f"line {pin} was set lowe ")
   finally:
      led_line.release()

pin1 = sys.argv[1]
setPinLow(int(pin1))

