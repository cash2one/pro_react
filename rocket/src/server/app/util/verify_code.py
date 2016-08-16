# -*-coding:utf8-*-
from PIL import Image,ImageDraw, ImageFont, ImageFilter
import random

class VerifyCode():

    def __init__(self):
        self._letter_cases = 'abcdefghjkmnpqrstuvwxy'
        self._upper_cases = self._letter_cases.upper()
        self._numbers = ''.join(map(str, range(2, 9)))
        pass

    def createCodeImage(self,size=(128,46),
                        mode='RGB',bg_color=(17,25,25),fg_color=(25,124,122),
                        font_size=24,
                        #font_type='Microsoft Sans Serif.ttf',
                        font_type='/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',
                        length=4):
        width,height = size
        img = Image.new(mode, size, bg_color)
        draw = ImageDraw.Draw(img)

        def get_chars():
            return random.sample(self._letter_cases+self._upper_cases+self._numbers,length)

        def create_strs():
            c_chars = get_chars()
            strs = ' %s ' % ' '.join(c_chars)
            font = ImageFont.truetype(font_type, font_size)
            font_width, font_height = font.getsize(strs)
            draw.text(((width - font_width) / 3, (height - font_height) / 3),
                        strs, font=font, fill=fg_color)
            return ''.join(c_chars)

        strs = create_strs()

        # params = [1 - float(random.randint(1, 2)) / 100,
        #           0,
        #           0,
        #           0,
        #           1 - float(random.randint(1, 10)) / 100,
        #           float(random.randint(1, 2)) / 500,
        #           0.001,
        #           float(random.randint(1, 2)) / 500
        #           ]
        # img = img.transform(size, Image.PERSPECTIVE, params)
        return img, strs

if __name__ == '__main__':
    code_img,capacha_code= VerifyCode().createCodeImage()
    print capacha_code
    code_img.save('xx.jpg','JPEG')