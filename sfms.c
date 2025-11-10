#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <ctype.h>
#include <errno.h>
#include <conio.h>
#include <windows.h>

#include <sys/stat.h>

#define MAX 100


#ifndef _MSC_VER
#define fscanf_s fscanf
#ifndef _countof
#define _countof(arr) (sizeof(arr) / sizeof((arr)[0]))
#endif
#ifndef ENABLE_VIRTUAL_TERMINAL_PROCESSING
#define ENABLE_VIRTUAL_TERMINAL_PROCESSING 0x0004
#endif
#endif

static void safe_strcpy(char *dest, size_t destSize, const char *src) {
    if (destSize == 0) return;
    strncpy(dest, src, destSize - 1);
    dest[destSize - 1] = '\0';
}

static void format_time_s(char *buffer, size_t bufferSize, const time_t *t) {
#if defined(_MSC_VER)
    ctime_s(buffer, bufferSize, t);
#else
    const char *s = ctime(t);
    if (s) {
        safe_strcpy(buffer, bufferSize, s);
    } else if (bufferSize > 0) {
        buffer[0] = '\0';
    }
#endif
}

// ANSI color codes
#define RED "\x1b[31m"
#define GREEN "\x1b[32m"
#define YELLOW "\x1b[33m"
#define BLUE "\x1b[34m"
#define MAGENTA "\x1b[35m"
#define CYAN "\x1b[36m"
#define RESET "\x1b[0m"

// Function prototypes
void displayUserMenu();
int isValidPassword(const char *password);
void getPasswordInput(char *password);
void viewMetadata(const char *filename);
void modifyFile();
void enableANSIColors();
int registerUser();
int loginUser();

int main() {
    enableANSIColors();

    int authenticated = 0;
    while (1) {
        // Authentication loop
        while (!authenticated) {
            printf(YELLOW "\n========== Secure File Management ==========\n" RESET);
            printf(YELLOW "1. Register\n2. Login\n3. Exit\nChoose option: " RESET);
            int option;
            
           
            if (scanf("%d", &option) != 1) {
               
                while(getchar() != '\n');
                printf(RED "\n✘ Invalid input. Please enter a number.\n" RESET);
                continue;
            }
            getchar(); 

            if (option == 1) {
                if (registerUser()) {
                    printf(GREEN "\n✔ Registration successful! Please login.\n" RESET);
                }
            } else if (option == 2) {
                if (loginUser()) {
                    printf(GREEN "\n✔ Login successful!\n" RESET);
                    authenticated = 1;
                } else {
                    printf(RED "\n✘ Login failed. Try again.\n" RESET);
                }
            } else if (option == 3) {
                printf(GREEN "\n✔ Exiting program. Goodbye!\n" RESET);
                exit(0);
            } else {
                printf(RED "\n✘ Invalid option. Try again.\n" RESET);
            }
        }

        int choice;
        char filename[MAX];

        // Main menu loop
        while (authenticated) {
            displayUserMenu();
            printf(YELLOW "\nEnter your choice: " RESET);
            
            if (scanf("%d", &choice) != 1) {
                while(getchar() != '\n');
                printf(RED "\n✘ Invalid input. Please enter a number.\n" RESET);
                continue;
            }
            getchar();

            switch (choice) {
                case 1: { // Write File
                    printf(CYAN "\nEnter file name to create (with extension, e.g., 'file.txt'): " RESET);
                    fgets(filename, MAX, stdin);
                    filename[strcspn(filename, "\n")] = 0; 

                    if (strchr(filename, '.') == NULL) {
                      
                        if (strlen(filename) + 4 < MAX) {
                            strcat(filename, ".txt");
                            printf(YELLOW "No extension provided. Defaulting to '%s'\n" RESET, filename);
                        } else {
                            printf(RED "\n✘ Filename is too long to add default .txt extension.\n" RESET);
                            break; 
                        }
                    }

                    FILE *f = fopen(filename, "w");
                    if (f) {
                        printf(MAGENTA "Enter content: " RESET);
                        char content[MAX];
                        fgets(content, MAX, stdin);
                        fputs(content, f);
                        fclose(f);
                        printf(GREEN "\n✔ File '%s' created successfully!\n" RESET, filename);
                    } else {
                        printf(RED "\n✘ Failed to open file for writing.\n" RESET);
                    }
                    break;
                }

                case 2: { // Read File
                    printf(CYAN "\nEnter file name to read: " RESET);
                    fgets(filename, MAX, stdin);
                    filename[strcspn(filename, "\n")] = 0;

                    FILE *fr = fopen(filename, "r");
                    if (fr) {
                        printf("\n" YELLOW "--- File Content ---\n" RESET);
                        int c;
                        while ((c = fgetc(fr)) != EOF) {
                            putchar(c);
                        }
                        fclose(fr);
                        printf(GREEN "\n--- End of File ---\n" RESET);
                    } else {
                        printf(RED "\n✘ File not found or cannot be read.\n" RESET);
                    }
                    break;
                }

                case 3: { // View Metadata
                    printf(CYAN "\nEnter file name to view metadata: " RESET);
                    fgets(filename, MAX, stdin);
                    filename[strcspn(filename, "\n")] = 0;
                    viewMetadata(filename);
                    break;
                }

                case 4: { // Logout
                    printf(GREEN "\n✔ Logged out. Returning to main menu...\n" RESET);
                    authenticated = 0; 
                    break;
                }

                case 5: { // Modify File
                    modifyFile();
                    break;
                }

                default:
                    printf(RED "\n✘ Invalid choice. Please try again.\n" RESET);
            }
        }
    }

    return 0; 
}

void displayUserMenu() {
    printf(CYAN "\n========== " YELLOW "Secure File Management Menu" CYAN " ==========\n" RESET);
    printf(GREEN "1. " RESET "Write File\n");
    printf(GREEN "2. " RESET "Read File\n");
    printf(GREEN "3. " RESET "View Metadata\n");
    printf(GREEN "4. " RESET "Logout\n");
    printf(GREEN "5. " RESET "Modify File\n");
    printf(CYAN "===========================================\n" RESET);
}

int isValidPassword(const char *password) {
    if (strlen(password) < 8) return 0;
    int hasUpper = 0, hasLower = 0, hasDigit = 0, hasSpecial = 0;
    for (int i = 0; password[i]; i++) {
        if (isupper((unsigned char)password[i])) hasUpper = 1;
        else if (islower((unsigned char)password[i])) hasLower = 1;
        else if (isdigit((unsigned char)password[i])) hasDigit = 1;
       
        else if (isprint((unsigned char)password[i]) && !isalnum((unsigned char)password[i])) hasSpecial = 1;
    }
    return hasUpper && hasLower && hasDigit && hasSpecial;
}

void getPasswordInput(char *password) {
    int i = 0;
    int ch;
  
    while ((ch = _getch()) != '\r' && i < MAX - 1) {
        if (ch == 8) { 
            if (i > 0) {
                i--;
                printf("\b \b"); 
            }
        } else if (isprint((unsigned char)ch)) { 
            password[i++] = ch;
            printf("*");
        }
    }
    password[i] = '\0'; 
    printf("\n"); 


void viewMetadata(const char *filename) {
#if defined(_MSC_VER)
    struct _stat64 info; 
    if (_stat64(filename, &info) == 0) {
#else
    struct stat info;
    if (stat(filename, &info) == 0) {
#endif
        const char *ext = strrchr(filename, '.');
        if (ext) {
            ext++; 
        } else {
            ext = "No extension";
        }

        printf(YELLOW "\n--- File Metadata ---\n" RESET);
        printf(BLUE "Name: " RESET "%s\n", filename);
        printf(BLUE "Type: " RESET "%s\n", ext);
        printf(BLUE "Size: " RESET "%lld bytes\n", (long long)info.st_size);
        // Time conversion
        char timeBuf[26];
        format_time_s(timeBuf, sizeof(timeBuf), &info.st_mtime);
        printf(BLUE "Last Modified: " RESET "%s", timeBuf);
        format_time_s(timeBuf, sizeof(timeBuf), &info.st_atime);
        printf(BLUE "Last Accessed: " RESET "%s", timeBuf);
    } else {
        int err = errno;
        printf(RED "\n✘ Error retrieving metadata: %s\n" RESET, strerror(err));
    }
}

void modifyFile() {
    char oldName[MAX], newName[MAX], newContent[MAX];
    printf(CYAN "\nEnter existing file name: " RESET);
    fgets(oldName, MAX, stdin);
    oldName[strcspn(oldName, "\n")] = 0;

    FILE *fp = fopen(oldName, "r");
    if (!fp) {
        printf(RED "\n✘ File not found!\n" RESET);
        return;
    }
    fclose(fp);

    printf(YELLOW "Enter new filename (or press enter to skip): " RESET);
    fgets(newName, MAX, stdin);
    newName[strcspn(newName, "\n")] = 0;

    printf(YELLOW "Enter new content (or press enter to skip): " RESET);
    fgets(newContent, MAX, stdin);
    newContent[strcspn(newContent, "\n")] = 0;

    int renamed = 0;
    if (strlen(newName) > 0) {
        if (rename(oldName, newName) == 0) {
            printf(GREEN "\n✔ File renamed to '%s'.\n" RESET, newName);
            safe_strcpy(oldName, MAX, newName);
            renamed = 1;
        } else {
            int err = errno;
            printf(RED "\n✘ Error renaming file: %s\n" RESET, strerror(err));
        }
    }

    if (strlen(newContent) > 0) {
        FILE *fw = fopen(oldName, "w"); 
        if (fw) {
            fputs(newContent, fw);
            fclose(fw);
            printf(GREEN "\n✔ File content modified successfully.\n" RESET);
        } else {
            printf(RED "\n✘ Failed to write new content.\n" RESET);
        }
    } else if (renamed) {
       
        printf(GREEN "\n✔ File modified successfully.\n" RESET);
    } else if (strlen(newName) == 0 && strlen(newContent) == 0) {
        printf(YELLOW "\nNo changes made.\n" RESET);
    }
}

void enableANSIColors() {
    HANDLE hOut = GetStdHandle(STD_OUTPUT_HANDLE);
    if (hOut == INVALID_HANDLE_VALUE) return;

    DWORD dwMode = 0;
    if (!GetConsoleMode(hOut, &dwMode)) return;

    dwMode |= ENABLE_VIRTUAL_TERMINAL_PROCESSING;
    if (!SetConsoleMode(hOut, dwMode)) {
       
    }
}

int registerUser() {
    char uname[MAX], pwd[MAX];
    printf(YELLOW "\n--- Register New User ---\n" RESET);
    printf(YELLOW "Enter username: " RESET);
    fgets(uname, MAX, stdin);
    uname[strcspn(uname, "\n")] = 0;

   
    FILE *fr = fopen("users.txt", "r");
    if (fr) {
        char fileU[MAX], fileP[MAX];
        while (fscanf(fr, "%99s %99s", fileU, fileP) == 2) {
            if (strcmp(fileU, uname) == 0) {
                printf(RED "\n✘ Username '%s' already exists.\n" RESET, uname);
                fclose(fr);
                return 0;
            }
        }
        fclose(fr);
    }

    while (1) {
        printf(YELLOW "Enter password (min 8 chars, needs upper, lower, digit, special): " RESET);
        getPasswordInput(pwd);
        if (isValidPassword(pwd)) {
            FILE *f = fopen("users.txt", "a");
            if (f) {
                fprintf(f, "%s %s\n", uname, pwd); 
                fclose(f);
                return 1;
            } else {
                printf(RED "\n✘ Error saving user data.\n" RESET);
                return 0;
            }
        } else {
            printf(RED "\n✘ Password must be at least 8 chars and include uppercase, lowercase, digit, and a special character.\n" RESET);
        }
    }
}

int loginUser() {
    char uname[MAX], pwd[MAX], fileU[MAX], fileP[MAX];
    printf(YELLOW "\n--- Login ---\n" RESET);
    printf(YELLOW "Enter username: " RESET);
    fgets(uname, MAX, stdin);
    uname[strcspn(uname, "\n")] = 0;

    printf(YELLOW "Enter password: " RESET);
    getPasswordInput(pwd);

    FILE *f = fopen("users.txt", "r");
    if (!f) {
        printf(RED "No user data found. Please register.\n" RESET);
        return 0;
    }

    while (fscanf(f, "%99s %99s", fileU, fileP) == 2) {
        if (strcmp(fileU, uname) == 0 && strcmp(fileP, pwd) == 0) {
            fclose(f);
            return 1; 
        }
    }

    fclose(f);
    return 0; 
}
