import pygame
from pygame.locals import *
import random

pygame.mixer.init()
pygame.init()

# name
pygame.display.set_caption("LITTLE PILOT")

# กำหนดขนาดหน้าจอ
game_width = 1200
game_height = 800
screen_size = (game_width, game_height)
screen = pygame.display.set_mode(screen_size)
padding_y = 50
padding_x = 50

# เสียงเมื่อเครื่องบินชนกับศัตรู
collision_sound = pygame.mixer.Sound('sound/chon.wav')
collision_sound.set_volume(0.5)

# เสียง GAME OVER
game_over_sound = pygame.mixer.Sound('sound/game_over.wav')
game_over_sound.set_volume(0.2)

# สี
black = (0,0,0)
red = (255,0,0)
yellow = (255,255,0)

# cooldown กระสุน
bullet_cooldown = 300

# เวลาล่าสุดที่ยิงกระสุน
last_bullet_time = pygame.time.get_ticks()

# เสียงยิง
bullet_sound = pygame.mixer.Sound('sound/laser.wav')
bullet_sound.set_volume(0.2)    

# เวลาศัตรูตัวถัดไป
next_enemy = pygame.time.get_ticks()

# ฟังก์ชัน font
def get_font(size): 
    return pygame.font.Font("assets/Nortune-Black.ttf", size)

# ฟังก์ชันสำหรับปรับขนาดรูปภาพ
def scale_image(image , new_width):
    image_scale = new_width / image.get_rect().width
    new_height = image.get_rect().height * image_scale
    scaled_size = (new_width , new_height)
    return pygame.transform.scale(image , scaled_size)

# background
backg = [pygame.image.load('image/bg1.png').convert_alpha(),
               pygame.image.load('image/bg2.png').convert_alpha(),
               pygame.image.load('image/bg3.png').convert_alpha()]

selected_bg = random.choice(backg)
bg = selected_bg
bg_scroll = 0

background_images = backg

# func สุ่มพื้นหลัง
def randomize_background():
    selected_background = random.choice(backg)
    return selected_background

# หัวใจ img
heart_images = []
heart_image_index = 0 
for i in range(4):
    heart_image = pygame.image.load(f'image/hearts/heart{i}.png').convert_alpha()
    heart_image = scale_image(heart_image,35)
    heart_images.append(heart_image)

# สีศัตรู
enemy_colors = ['blue','brown','red','green']
enemy_images = {}


for enemy_color in enemy_colors:

    
    enemy_images[enemy_color] = []

    for i in range(2):

       
        enemy_image = pygame.image.load(f'image/enemy/{enemy_color}{i}.png').convert_alpha()
        enemy_image = scale_image(enemy_image, 50)

        
        enemy_image = pygame.transform.flip(enemy_image, True, False)

        
        enemy_images[enemy_color].append(enemy_image)

def scale_image(image , new_width):
    image_scale = new_width / image.get_rect().width
    new_height = image.get_rect().height * image_scale
    scaled_size = (new_width , new_height)
    return pygame.transform.scale(image , scaled_size)

# กลุ่มของเครื่องบินผู้เล่น
player_group = pygame.sprite.Group()
# กลุ่มของ กระสุน
bullet_group = pygame.sprite.Group()
# กลุ่มของศัตรู
enemy_group = pygame.sprite.Group()

# เครื่องบินผู้เล่น
airplane_images = []
for i in range(2):
    airplane_image = pygame.image.load(f'image/player/fly{i}.png').convert_alpha()
    airplane_image = scale_image(airplane_image,120) # ปรับขนาด player
    airplane_images.append(airplane_image)

class Player(pygame.sprite.Sprite):
    def __init__(self, x, y):
        pygame.sprite.Sprite.__init__(self)
        self.x = x
        self.y = y

        self.lives = 3
        self.score = 0

        self.image_index = 0
        self.image_angle = 0

        self.invulnerable = False  # เพิ่มตัวแปรสถานะความไม่เสียหาย
        self.invulnerability_start_time = 0

    def update(self):
        # อัปเดตภาพของเครื่องบินผู้เล่นและตรวจสอบการชน
        if not self.invulnerable:
            self.image_index += 1
            if self.image_index >= len(airplane_images):
                self.image_index = 0

            self.image = airplane_images[self.image_index]
            self.rect = self.image.get_rect()

            self.image = pygame.transform.rotate(self.image, self.image_angle)

            self.rect.x = self.x
            self.rect.y = self.y

            if pygame.sprite.spritecollide(self, enemy_group, True):
                collision_sound.play()
                self.lives -= 1
                self.invulnerable = True  # เริ่มต้นสถานะความไม่เสียหาย
                self.invulnerability_start_time = pygame.time.get_ticks()

        # เมื่ออยู่ในสถานะความไม่เสียหาย
        if pygame.sprite.spritecollide(self, bullet_group, True):
            if not self.invulnerable and pygame.time.get_ticks() - self.last_hit_time > 200:  # ตรวจสอบว่าไม่อยู่ในสถานะความไม่เสียหายและผ่านไปเวลามากกว่า 200 มิลลิวินาที
                self.last_hit_time = pygame.time.get_ticks()  # อัปเดตเวลาการชนล่าสุด
                collision_sound.play()
                self.lives -= 1
                self.invulnerable = True
                self.invulnerability_start_time = pygame.time.get_ticks()

                self.last_bullet_time = 0

        # แสดงการกระพริบเมื่อเริ่มต้นสถานะความไม่เสียหาย

        current_time = pygame.time.get_ticks()
        if self.invulnerable:
            current_time = pygame.time.get_ticks()
            if (current_time - self.invulnerability_start_time) % 400 < 200:
                self.image.set_alpha(0)
            else:
                self.image.set_alpha(255)

        if current_time - self.invulnerability_start_time > 1000:  # ตั้งค่าเวลากระพริบ
            self.invulnerable = False  # เปิดการใช้งานอีกครั้งหลังจากกระพริบเสร็จสิ้น

# คลาสสำหรับศัตรู
class Enemy(pygame.sprite.Sprite):                    
    
    def __init__(self):

        pygame.init()
        pygame.sprite.Sprite.__init__(self)

        self.x = game_width

        self.y = random.randint(padding_y, game_height - padding_y * 2 )

        self.color = random.choice(enemy_colors)         # สุ่มสีศัตรู

        self.image_index = 0

        self.image = enemy_images[self.color][self.image_index]
        self.rect = self.image.get_rect()
        self.rect.x = self.x
        self.rect.y = self.y
    
    def update(self):

        if player.score >= 0 and player.score <=5 :
            self.x -= 3                                 # ปรับความเร็วศัตรู
        elif player.score > 5 and player.score <= 10 :
            self.x -= 3.5 
        elif player.score > 10  and player.score <= 15 :
            self.x -= 4  
        elif player.score > 15 and player.score <= 30 :
            self.x -= 4.5   
        else :
            self.x -= 5  

        self.image_index += 0.1
        if self.image_index >= len(enemy_images[self.color]):
            self.image_index = 0

        self.image = enemy_images[self.color][int(self.image_index)]
        self.rect = self.image.get_rect()
        self.rect.x = self.x
        self.rect.y = self.y

        if pygame.sprite.spritecollide(self, bullet_group, True):
            self.kill()
            player.score += 1                                      

        if self.x < 0:
            self.kill()

# คลาสสำหรับกระสุน
class Bullet(pygame.sprite.Sprite):           
    
    def __init__(self , x , y):

        pygame.sprite.Sprite.__init__(self)
        self.x = x
        self.y = y
        self.radius = 25  # ปรับขนาดกระสุน

        self.rect = Rect(x,y,10,10)
        self.image = pygame.image.load('image/bullet.png')  
        self.image = pygame.transform.scale(self.image, (2 * self.radius, 2 * self.radius))  # ปรับขนาดภาพ

    def draw(self, screen):
        screen.blit(self.image, (self.x, self.y))
    
    
    def update(self):
        self.x += 5  # ความเร็วกระสุน

        self.rect.x = self.x
        self.rect.y = self.y

        if self.x > game_width:
            self.kill()

        # ตรวจสอบการชนกับศัตรู
        enemy_hit_list = pygame.sprite.spritecollide(self, enemy_group, True)
        for enemy in enemy_hit_list:
            player.score += 1  # เพิ่มคะแนนเมื่อยิงศัตรู
            self.kill()

# ตำแหน่งเริ่มต้นของเครื่องบินผู้เล่น
Player_x = 30
Player_y = game_height // 2

# สร้างเครื่องบินผู้เล่น
player = Player(Player_x,Player_y)
player_group.add(player)


# game loop
clock = pygame.time.Clock()
fps = 120
running = True

while running :
    clock.tick(fps)
    
    for event in pygame.event.get() :
        if event.type == QUIT :
            running = False
    
    keys = pygame.key.get_pressed()

    if keys[K_UP] and player.rect.top > padding_y:
        player.y -= 3  # ปรับความเร็วการเคลื่อนที่ขึ้น
        player.image_angle = 15
    elif keys[K_DOWN] and player.rect.bottom < game_height - padding_y:
        player.y += 3  # ปรับความเร็วการเคลื่อนที่ลง
        player.image_angle = -15
    elif keys[K_LEFT] and player.rect.left > padding_x:
        player.x -= 3  # ปรับความเร็วการเคลื่อนที่ไปทางซ้าย
        player.image_angle = 15
    elif keys[K_RIGHT] and player.rect.right < game_width - padding_x:
        player.x += 3  # ปรับความเร็วการเคลื่อนที่ไปทางขวา
        player.image_angle = -15
    else:
        player.image_angle = 0
    
    if keys[K_SPACE] and last_bullet_time + bullet_cooldown < pygame.time.get_ticks():     # spacebar เพื่อยิง
        bullet_x = player.x + player.image.get_width()
        bullet_y = player.y + player.image.get_height() // 2
        bullet = Bullet(bullet_x, bullet_y)
        bullet_group.add(bullet)
        last_bullet_time = pygame.time.get_ticks()
        bullet_sound.play()                          # เสียงยิง

        
    # ควบคุมการปรากฏศัตรู
    if next_enemy < pygame.time.get_ticks():
        enemy = Enemy()
        enemy_group.add(enemy)
        
        # ปรับความยาก
        if player.score >=0 and player.score <=5 : 
            next_enemy = random.randint(pygame.time.get_ticks(),pygame.time.get_ticks()+2500)
        elif player.score > 5 and player.score <=10 :
            next_enemy = random.randint(pygame.time.get_ticks(),pygame.time.get_ticks()+2000)
        elif player.score > 10 and player.score <=15 :
            next_enemy = random.randint(pygame.time.get_ticks(),pygame.time.get_ticks()+1500)
        elif player.score > 15 and player.score <=30 :
            next_enemy = random.randint(pygame.time.get_ticks(),pygame.time.get_ticks()+1000)
        elif player.score > 30 and player.score <=35 :
            next_enemy = random.randint(pygame.time.get_ticks(),pygame.time.get_ticks()+500)
        else :
            next_enemy = random.randint(pygame.time.get_ticks(),pygame.time.get_ticks()+250)
            
    # วาด backg
    screen.blit(bg,(0 - bg_scroll,0))
    screen.blit(bg,(game_width - bg_scroll,0))
    bg_scroll += 1
    if bg_scroll == game_width :
        bg_scroll = 0


    # update
    player_group.update()
    player_group.draw(screen)

    bullet_group.update()
    for bullet in bullet_group:
        bullet.draw(screen)

    enemy_group.update()
    enemy_group.draw(screen)

    # ตำแหน่ง Heart
    for i in range(player.lives):
        heart_image = heart_images[int(heart_image_index)]
        heart_x = 15 + i * (heart_image.get_width()+10)
        heart_y = 15
        screen.blit(heart_image,(heart_x,heart_y))
    heart_image_index += 0.03
    if heart_image_index >= len(heart_images) :
        heart_image_index = 0

    # แถบ score
    font = get_font(35)
    text = font.render(f'Score : {player.score}',True,'white')
    text_rect = text.get_rect()
    text_rect.center = (1100 , 30)
    screen.blit(text,text_rect)

    pygame.display.update()

    game_over = False
    mouse_clicked = False

    if player.lives == 0 :
        game_over_sound.play()
        
    while player.lives == 0 and not game_over:
        clock.tick(fps)

        for event in pygame.event.get():
            if event.type == QUIT:
                pygame.quit()
            elif event.type == MOUSEBUTTONDOWN and event.button == 1:
                mouse_clicked = True
        
        
        # backg game_over
        game_over_bg = pygame.image.load('image/main.png').convert_alpha()
        screen.blit(game_over_bg, (0, 0))
        
        # แสดงหน้าเกม OVER
        gameover_str = 'Game Over'
        font = get_font(120)
        text = font.render(gameover_str, True, red)
        text_rect = text.get_rect()
        text_rect.center = (game_width / 2, game_height / 2 - 200)
        screen.blit(text, text_rect)

        # show score
        score_str = f'Score : {player.score}'
        font = get_font(65)
        text = font.render(score_str, True, red)
        text_rect = text.get_rect()
        text_rect.center = (game_width / 2, game_height / 2 - 50)
        screen.blit(text, text_rect)
        
        # ปุ่ม restart
        restart_text = get_font(50).render("Restart", True, 'white')
        restart_rect = restart_text.get_rect()
        restart_rect.center = (game_width / 2, game_height / 2 + 150)
        screen.blit(restart_text, restart_rect)

        # ปุ่ม quit game
        quit_text = get_font(50).render("Quit Game", True, 'white')
        quit_rect = quit_text.get_rect()
        quit_rect.center = (game_width / 2, game_height / 2 + 250)
        screen.blit(quit_text, quit_rect)

        pygame.display.flip()

        # restart game
        if mouse_clicked:
            if restart_rect.collidepoint(pygame.mouse.get_pos()):
                game_over = False  # รีเซ็ตสถานะเกม
                player_group.empty()
                bullet_group.empty()
                enemy_group.empty()
                player = Player(Player_x, Player_y)  
                player_group.add(player)
                player.score = 0
                mouse_clicked = False

                selected_background = randomize_background()
                bg = selected_background
                
        
            # quit game
            elif quit_rect.collidepoint(pygame.mouse.get_pos()):
                running = False
                break

        pygame.display.flip()

pygame.quit()


    
