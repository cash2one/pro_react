from bs4 import BeautifulSoup

def strip_tags(html, valid_tags=[]):
    soup = BeautifulSoup(html)
    for match in soup.findAll():
        print match.name
        if match.name == "em":
            continue
        else:
            match.replaceWithChildren()
    return str(soup)