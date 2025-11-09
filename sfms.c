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
