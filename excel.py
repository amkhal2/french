from openpyxl import load_workbook
import os, random

path = r"d:\Mon Dictionnaire.xlsx"

def get_rows(path):
    wb = load_workbook(path)
    ws = wb["Français"]
    rows = iter(list(ws.rows))
    a = next(rows)  # to skip the first row
    b = next(rows)  # to skip the second row

    c = 0
    refined_rows = []
    for row in rows:
        if row[1].value and row[2].value and row[7].value: 
##            print(row[1].value)     # mot
##            print(row[2].value)     # classement
##            print(row[7].value)     # signification
##            print()

            # we need only to save the value of the first line in "signification"
            # to hide any hint of the right answer
            meaning = row[7].value.split('\n')[0]

            refined_rows.append((row[1].value, row[2].value, meaning))
            c = c + 1

##    print(c)
    return refined_rows

##rows = get_rows(path)
##
##category = {}
##for row in rows:
##    print(row)
##    if row[1].strip() in category:
##        category[row[1].strip()] = category[row[1].strip()] + 1
##    else:
##        category[row[1].strip()] = 1   
##    print()
##
##print(category)    
##
### a list of sorted "key, value" pairs
##sorted_cat = sorted(category.items(), key=lambda x:x[1],reverse=True)
##print(sorted_cat)
##
##sample = random.sample(rows, 10)
##print(sample)


