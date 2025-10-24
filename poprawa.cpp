#include <iostream>
#include <vector>
#include <string>

class Pozycja {
protected:
    std::string tytul;
    int rokWydania;
    int id;
public:
    Pozycja(std::string tytul_, int rok_, int id_)
        : tytul(tytul_), rokWydania(rok_), id(id_) {}
    virtual ~Pozycja() {}

    std::string getTytul() const { return tytul; }
    int getRokWydania() const { return rokWydania; }
    int getId() const { return id; }

    virtual void wypiszInfo() const = 0;
};

class Ksiazka : public Pozycja {
    std::string autor;
    int liczbaStron;
public:
    Ksiazka(std::string tytul_, int rok_, int id_, std::string autor_, int liczbaStron_)
        : Pozycja(tytul_, rok_, id_), autor(autor_), liczbaStron(liczbaStron_) {}
    Ksiazka(const Ksiazka& other)
        : Pozycja(other.tytul, other.rokWydania, other.id), autor(other.autor), liczbaStron(other.liczbaStron) {}

    void wypiszInfo() const override {
        std::cout << "Ksiazka: " << tytul << ", " << autor << ", Rok: " << rokWydania 
                  << ", Strony: " << liczbaStron << ", ID: " << id << std::endl;
    }
    ~Ksiazka() {
        std::cout << "Ksiazka \"" << tytul << "\" jest usuwana z systemu.\n";
    }
};

class Czasopismo : public Pozycja {
    int numer;
    int miesiac;
public:
    Czasopismo(std::string tytul_, int rok_, int id_, int numer_, int miesiac_)
        : Pozycja(tytul_, rok_, id_), numer(numer_), miesiac(miesiac_) {}

    void wypiszInfo() const override {
        std::cout << "Czasopismo: " << tytul << ", Numer: " << numer 
                  << ", Miesiac: " << miesiac << ", Rok: " << rokWydania << ", ID: " << id << std::endl;
    }
    ~Czasopismo() {
        std::cout << "Czasopismo \"" << tytul << "\" jest usuwane z systemu.\n";
    }
};

class Wypozyczenie {
public:
    Pozycja* pozycja;
    std::string czytelnik;
    std::string dataWypozyczenia;

    Wypozyczenie(Pozycja* p, std::string czytelnik_, std::string data_)
        : pozycja(p), czytelnik(czytelnik_), dataWypozyczenia(data_) {}
};

class Biblioteka {
    std::vector<Pozycja*> kolekcja;
public:
    ~Biblioteka() {
        for (auto p : kolekcja) {
            delete p;
        }
    }
    void dodajPozycje(Pozycja* nowaPozycja) {
        kolekcja.push_back(nowaPozycja);
    }
    void usunPozycje(int id) {
        for (auto it = kolekcja.begin(); it != kolekcja.end(); ++it) {
            if ((*it)->getId() == id) {
                delete *it;
                kolekcja.erase(it);
                break;
            }
        }
    }
    Pozycja* znajdzPozycje(int id) {
        for (auto p : kolekcja)
            if (p->getId() == id) return p;
        return nullptr;
    }
    void wypiszWszystko() const {
        for (auto p : kolekcja)
            p->wypiszInfo();
    }
};

int main() {
    Biblioteka bib;
    bib.dodajPozycje(new Ksiazka("Potop", 1886, 1, "Sienkiewicz", 950));
    bib.dodajPozycje(new Czasopismo("Polityka", 2025, 2, 44, 10));

    std::cout << "Wszystko w bibliotece:\n";
    bib.wypiszWszystko();

    bib.usunPozycje(1);

    std::cout << "\nPo usunięciu książki:\n";
    bib.wypiszWszystko();

    return 0;
}
