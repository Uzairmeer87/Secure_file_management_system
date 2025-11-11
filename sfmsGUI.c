#include <windows.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <ctype.h>
#include <errno.h>
#include <sys/stat.h>

#define MAX 100
#define ID_BTN_LOGIN 1001
#define ID_BTN_REGISTER 1002
#define ID_BTN_EXIT 1003
#define ID_BTN_WRITE 1004
#define ID_BTN_READ 1005
#define ID_BTN_METADATA 1006
#define ID_BTN_MODIFY 1007
#define ID_BTN_LOGOUT 1008
#define ID_BTN_SUBMIT_LOGIN 1009
#define ID_BTN_SUBMIT_REGISTER 1010
#define ID_EDIT_USERNAME 2001
#define ID_EDIT_PASSWORD 2002
#define ID_EDIT_FILENAME 2003
#define ID_EDIT_CONTENT 2004
#define ID_EDIT_NEWFILENAME 2005
#define ID_EDIT_NEWCONTENT 2006
#define ID_STATIC_DISPLAY 3001

#define COLOR_BG RGB(245, 247, 250)
#define COLOR_BTN RGB(52, 152, 219)
#define COLOR_BTN_HOVER RGB(41, 128, 185)
#define COLOR_TEXT RGB(44, 62, 80)
#define COLOR_SUCCESS RGB(46, 204, 113)
#define COLOR_ERROR RGB(231, 76, 60)

HWND g_hMainWnd = NULL;
HWND g_hLoginWnd = NULL;
HWND g_hRegisterWnd = NULL;
HWND g_hMainMenuWnd = NULL;
HWND g_hFileOpWnd = NULL;
int g_isLoggedIn = 0;
HFONT g_hFont = NULL;
HFONT g_hTitleFont = NULL;

LRESULT CALLBACK MainWndProc(HWND, UINT, WPARAM, LPARAM);
LRESULT CALLBACK LoginWndProc(HWND, UINT, WPARAM, LPARAM);
LRESULT CALLBACK RegisterWndProc(HWND, UINT, WPARAM, LPARAM);
LRESULT CALLBACK MainMenuWndProc(HWND, UINT, WPARAM, LPARAM);
LRESULT CALLBACK FileOpWndProc(HWND, UINT, WPARAM, LPARAM);
void createMainWindow();
void createLoginWindow();
void createRegisterWindow();
void createMainMenuWindow();
void createFileOpWindow(const char* operation);
int validatePassword(const char* pwd);
void saveUser(const char* username, const char* password);
int checkUserExists(const char* username);
int verifyLogin(const char* username, const char* password);
void showFileMetadata(const char* filename, HWND hwnd);
void writeToFile(const char* filename, const char* content);
char* readFromFile(const char* filename);
void modifyFileContent(const char* oldName, const char* newName, const char* newContent);
void showMessage(HWND parent, const char* title, const char* message, int isError);
HWND createModernButton(HWND parent, const char* text, int x, int y, int w, int h, int id);
HWND createLabel(HWND parent, const char* text, int x, int y, int w, int h);
HWND createEdit(HWND parent, int x, int y, int w, int h, int id, int isPassword);
void initFonts();

int validatePassword(const char* pwd) {
    if (!pwd || strlen(pwd) < 8) {
        return 0;
    }
    
    int hasUpper = 0, hasLower = 0, hasDigit = 0, hasSpecial = 0;
    int len = strlen(pwd);
    
    for (int i = 0; i < len; i++) {
        if (isupper(pwd[i])) {
            hasUpper = 1;
        } else if (islower(pwd[i])) {
            hasLower = 1;
        } else if (isdigit(pwd[i])) {
            hasDigit = 1;
        } else if (isprint(pwd[i]) && !isalnum(pwd[i])) {
            hasSpecial = 1;
        }
    }
    
    return (hasUpper && hasLower && hasDigit && hasSpecial);
}

int checkUserExists(const char* username) {
    FILE* f = fopen("users.txt", "r");
    if (!f) return 0;
    
    char fileU[MAX], fileP[MAX];
    while (fscanf(f, "%99s %99s", fileU, fileP) == 2) {
        if (strcmp(fileU, username) == 0) {
            fclose(f);
            return 1;
        }
    }
    fclose(f);
    return 0;
}

void saveUser(const char* username, const char* password) {
    FILE* f = fopen("users.txt", "a");
    if (f) {
        fprintf(f, "%s %s\n", username, password);
        fclose(f);
    }
}

int verifyLogin(const char* username, const char* password) {
    FILE* f = fopen("users.txt", "r");
    if (!f) return 0;
    
    char fileU[MAX], fileP[MAX];
    while (fscanf(f, "%99s %99s", fileU, fileP) == 2) {
        if (strcmp(fileU, username) == 0 && strcmp(fileP, password) == 0) {
            fclose(f);
            return 1;
        }
    }
    fclose(f);
    return 0;
}

void showMessage(HWND parent, const char* title, const char* message, int isError) {
    UINT type = isError ? MB_ICONERROR | MB_OK : MB_ICONINFORMATION | MB_OK;
    MessageBox(parent, message, title, type);
}

void showFileMetadata(const char* filename, HWND hwnd) {
    struct stat info;
    
    if (stat(filename, &info) != 0) {
        showMessage(hwnd, "Error", "File not found or cannot access metadata.", 1);
        return;
    }
    
    char msg[500];
    const char* ext = strrchr(filename, '.');
    if (!ext) {
        ext = "No extension";
    } else {
        ext++;
    }
    
    sprintf(msg, "File Name: %s\n\nFile Type: %s\nSize: %lld bytes\n", 
            filename, ext, (long long)info.st_size);
    
    char timeBuf[30];
    struct tm* timeinfo = localtime(&info.st_mtime);
    strftime(timeBuf, sizeof(timeBuf), "%Y-%m-%d %H:%M:%S", timeinfo);
    strcat(msg, "Last Modified: ");
    strcat(msg, timeBuf);
    strcat(msg, "\n");
    
    timeinfo = localtime(&info.st_atime);
    strftime(timeBuf, sizeof(timeBuf), "%Y-%m-%d %H:%M:%S", timeinfo);
    strcat(msg, "Last Accessed: ");
    strcat(msg, timeBuf);
    
    showMessage(hwnd, "File Metadata", msg, 0);
}
