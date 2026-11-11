

from PIL import Image, ImageDraw
size=48
img=Image.new('RGBA',(size,size),(34,177,76,255))
d=ImageDraw.Draw(img)
# house
d.line([(8,20),(24,8),(40,20)],fill='white',width=3)
d.line([(12,20),(12,38),(36,38),(36,20)],fill='white',width=3)
# radiator
for x in [17,21,25,29]:
    d.rounded_rectangle((x,23,x+2,33),1,fill='white')
# heat waves
d.arc((17,13,21,21),200,20,fill='orange',width=1)
d.arc((23,13,27,21),200,20,fill='orange',width=1)

img.save('./app/icon.1.ico',sizes=[(48,48)])

print('/app/icon.ico')

