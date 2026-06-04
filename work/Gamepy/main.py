import pygame , sys
from button import Button

pygame.mixer.init()
pygame.init()

# เสียงหน้า menu
sound = pygame.mixer.Sound('sound/Ove Melaa - ItaloLoopDikkoDikko.wav')
sound.set_volume(0.01)

# สร้างหน้าต่างแสดงผล
SCREEN = pygame.display.set_mode((1200, 800))
pygame.display.set_caption("LITTLE PILOT")

# โหลดภาพพื้นหลังหน้าหลัก
BG = pygame.image.load("image/main.png")

# สี
black = (0,0,0)
red = (255,0,0)
yellow = (255,255,0)

# func font
def get_font(size): 
    return pygame.font.Font("assets/Nortune-Black.ttf", size)

# func menu
def main_menu():
    
    while True:
        sound.play()  # เล่นเสียงพร้อมกับเริ่มหน้าเมนูหลัก
        SCREEN.blit(BG, (0, 0))  # แสดงภาพพื้นหลัง

        MENU_MOUSE_POS = pygame.mouse.get_pos() # รับตำแหน่งเมาส์ปัจจุบัน

        MENU_TEXT = get_font(180).render(" LITTLE PILOT ", True,'red')
        MENU_RECT = MENU_TEXT.get_rect(center=(600, 200))
        pygame.draw.rect(SCREEN, 'white', MENU_RECT, border_radius=10)
        pygame.draw.rect(SCREEN, 'red', MENU_RECT, 5, border_radius=10)

        # สร้างปุ่ม "PLAY GAME"
        PLAY_BUTTON = Button(image=pygame.image.load("assets/Play Rect.png"), pos=(300, 620), 
                            text_input="PLAY GAME", font=get_font(50), base_color="#d7fcd4", hovering_color="White")
        # สร้างปุ่ม "QUIT"
        QUIT_BUTTON = Button(image=pygame.image.load("assets/Quit Rect.png"), pos=(900, 620), 
                            text_input="QUIT", font=get_font(50), base_color="#d7fcd4", hovering_color="White")
        
        # แสดงข้อความ "LITTLE PILOT"
        SCREEN.blit(MENU_TEXT, MENU_RECT.topleft)
        SCREEN.blit(MENU_TEXT, MENU_RECT)

        # ตรวจสอบความเปลี่ยนแปลงในสีของปุ่มและอัปเดตตามตำแหน่งเมาส์ปัจจุบัน
        for button in [PLAY_BUTTON , QUIT_BUTTON]:
            button.changeColor(MENU_MOUSE_POS)
            button.update(SCREEN)
        
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            # เข้าเกม
            if event.type == pygame.MOUSEBUTTONDOWN:
                if PLAY_BUTTON.checkForInput(MENU_MOUSE_POS):
                    sound.stop()
                    import game
                    return     # ออกจากเมนูหลักเพื่อเริ่มเกม
                
                # quit game
                if QUIT_BUTTON.checkForInput(MENU_MOUSE_POS):
                    pygame.quit()
                    sys.exit()
            

        pygame.display.flip()
        
   
main_menu()         # เรียกฟังก์ชันเมนูหลักเพื่อเริ่มเกม
