
// Création de l'objet Model

var Model = {
    editor: []
};

// Constructeur Point

function Point(x, y) {
    Object.defineProperties(this, {
        x: {
            configurable: false,
            enumerable: true,
            value: x,
            writable: false
        },
        y: {
            configurable: false,
            enumerable: true,
            value: y,
            writable: false
        }
    });
}


Point.prototype.horizontalSymmetry = function (n) {
    var new_x = this.x;
    var new_y;
    new_y = this.y + 2 * (n - this.y);
    return new Point(new_x, new_y);
};


Point.prototype.verticalSymmetry = function (n) {
    var new_x;
    var new_y = this.y;
    new_x = this.x + 2 * (n - this.x);
    return new Point(new_x, new_y);
};


Point.prototype.average = function (p, alpha) {
    var new_x;
    var new_y;
    new_x = this.x + alpha * (p.x - this.x);
    new_y = this.y + alpha * (p.y - this.y);
    return new Point(new_x, new_y);
};


Point.prototype.clone = function () {
    return new Point(this.x, this.y);
};


// Constructeur Segment

function Segment(p1, p2, color = "black") {
    Object.defineProperties(this, {
        color: {
            configurable: false,
            enumerable: true,
            value: color,
            writable: false
        },
        p1: {
            configurable: false,
            enumerable: true,
            value: p1,
            writable: false
        },
        p2: {
            configurable: false,
            enumerable: true,
            value: p2,
            writable: false
        }
    });
}


Segment.prototype.horizontalSymmetry = function (n) {
    var new_p1 = this.p1.horizontalSymmetry(n);
    var new_p2 = this.p2.horizontalSymmetry(n);
    return new Segment(new_p1, new_p2, this.color);
};


Segment.prototype.verticalSymmetry = function (n) {
    var new_p1 = this.p1.verticalSymmetry(n);
    var new_p2 = this.p2.verticalSymmetry(n);
    return new Segment(new_p1, new_p2, this.color);
};


Segment.prototype.average = function (segment, alpha) {
    var new_p1 = this.p1.average(segment.p1, alpha);
    var new_p2 = this.p2.average(segment.p2, alpha);
    return new Segment(new_p1, new_p2, this.color);
};

Segment.prototype.clone = function () {
    var new_p1 = this.p1.clone();
    var new_p2 = this.p2.clone();
    return new Segment(new_p1, new_p2, this.color);
};


document.addEventListener("DOMContentLoaded", function () {

    // Declarations de variables
    var canvas1 = document.getElementById("canvas1");
    var canvas2 = document.getElementById("canvas2");
    var ctx1 = canvas1.getContext("2d");
    var ctx2 = canvas2.getContext("2d");
    var point = null;
    var index = null;
    var fini = true;
    var ctrlClicked = false;

// Création de la Vue
    function paint(ctx, tab) {
        var p1;
        var p2;
        ctx.lineWidth = 6;
        ctx.lineJoin = "round";
        tab.forEach(function (segment) {
            p1 = segment.p1;
            p2 = segment.p2;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.closePath();

            // Met la couleur à jour et trace
            ctx.strokeStyle = segment.color;
            ctx.stroke();
        });
    }

    function repaint(key) {
        // Efface le contenu du canvas
        ctx1.clearRect(0, 0, canvas1.getAttribute("width"), canvas1.getAttribute("height"));
        ctx2.clearRect(0, 0, canvas2.getAttribute("width"), canvas2.getAttribute("height"));

        // Dessine le nouveau image et l'editeur
        if (key !== "pattern" + null) {
            paint(ctx1, Model[key]);
        }
        paint(ctx2, Model.editor);
    }

// Controle de l'editeur de dessin

    // La position de la souris sur le canvas
    function getMousePos(canvas, event) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: Math.round(event.clientX - rect.left),
            y: Math.round(event.clientY - rect.top)
        };
    }

    // Clic gauche de la souris
    function leftClick(event) {
        var color = document.getElementById("color").value;
        var mousePos = getMousePos(canvas2, event);
        var segment;
        var p1;
        var p2;
        if (!point) {
            // Crée un nouveau point
            point = new Point(mousePos.x, mousePos.y);

            // Represente le point par +
            repaint("pattern" + index);
            ctx2.font = "bold 15px sans-serif";
            ctx2.fillStyle = color;
            ctx2.fillText("+", mousePos.x, mousePos.y);
        } else {
            // Crée un nouveau segment
            p1 = point;
            p2 = new Point(mousePos.x, mousePos.y);
            segment = new Segment(p1, p2, color);

            // Ajoute le segment dans le model de l'editeur
            Model.editor.push(segment);

            // Affiche le model de l'editeur
            repaint("pattern" + index);
            document.getElementById("textarea").value = exportJSON();
            point = p2;
        }
    }

    // Nouvelle polyligne (Shift + Clic-gauche)
    function newPolyline() {
        point = null;
    }

    // Retour en arrière (Click droit ou autre que clic gauche)
    function rightClick() {
        var lastSegment;
        if (Model.editor.length !== 0) {
            // Enlève le dernier segment
            lastSegment = Model.editor.pop();
            point = lastSegment.p1;

            // Affiche le model de l'editeur
            repaint("pattern" + index);
        } else {
            point = null;
        }
    }

    // Symetrie verticale (Ctrl + G)
    function symmetryEditorV() {
        Model.editor = Model.editor.map(function (segment) {
            return segment.verticalSymmetry(canvas2.getAttribute("width") / 2);
        });
        repaint("pattern" + index);
    }

    // Symetrie horizontale (Ctrl + H)
    function symmetryEditorH() {
        Model.editor = Model.editor.map(function (segment) {
            return segment.horizontalSymmetry(canvas2.getAttribute("height") / 2);
        });
        repaint("pattern" + index);
    }

    // Importer le dessin (Clic sur le bouton import)
    function importEdition() {
        var n;
        var opt;
        var slct = document.getElementById("pattern");
        if (document.getElementById("textarea").value !== exportJSON()) {
            document.getElementById("textarea").style.backgroundColor = "red";
            document.getElementById("error").textContent = "the pattern editor must match the content of the text-area (Press DISPLAY AREA)";
        } else if (Model.editor.length !== 0) {
            n = Object.keys(Model).length - 1;
            Model["pattern" + n] = Model.editor;
            Model.editor = [];

            opt = document.createElement("option");
            opt.setAttribute("value", "pattern" + n);
            opt.textContent = "pattern" + n;
            slct.appendChild(opt);

            point = null;
            repaint("pattern" + index);
            document.getElementById("textarea").value = "";
            document.getElementById("error").textContent = "";
        }
    }

    // Exporter le dessin choisi (Clic sur le bouton export)
    function exportEdition() {
        var slct = document.getElementById("pattern");
        var key = slct.value;
        if (key !== "None") {
            Model.editor = Model[key].map((x) => x);
            document.getElementById("textarea").value = exportJSON();

            point = null;
            repaint("pattern" + index);
        }
    }

    // Affiche le contenu du textarea si il est valide (Clic sur Display Area)
    function displayArea() {
        if (verifArea()) {
            Model.editor = importJSON();
            repaint("pattern" + index);
            document.getElementById("textarea").style.backgroundColor = "white";
            document.getElementById("error").textContent = "";
        } else {
            document.getElementById("textarea").style.backgroundColor = "red";
            document.getElementById("error").textContent = "Syntax error in the text-area";

        }
    }

// Import/Export (JSON) de l'editeur dans le textarea

    // Import
    function importJSON() {
        var table = JSON.parse(document.getElementById("textarea").value);
        return table.map(function (tab) {
            var p1 = new Point(tab[0][0], tab[0][1]);
            var p2 = new Point(tab[1][0], tab[1][1]);
            var color = document.getElementById("color").value;
            return new Segment(p1, p2, color);
        });
    }

    // Export
    function exportJSON() {
        var table = [];
        Model.editor.forEach(function (segment) {
            var p1 = segment.p1;
            var p2 = segment.p2;
            table.push([[p1.x, p1.y], [p2.x, p2.y]]);
        });
        return JSON.stringify(table);
    }

    // Verification du model dans textarea
    function verifArea() {
        var msg = document.getElementById("textarea").value;
        var new_msg;
        var i;
        var ind;
        var cpt;
        if (msg.charAt(0) !== "[" || msg.charAt(msg.length - 1) !== "]") {
            return false;
        }
        new_msg = msg.slice(1, msg.length - 1) + ",";
        ind = 0;
        cpt = 0;
        for (i = 0; i < new_msg.length; i += 1) {
            if (new_msg.charAt(i) === ",") {
                cpt += 1;
            }
            if (cpt === 4) {
                cpt = 0;
                if (verifSegment(new_msg.slice(ind, i)) === false) {
                    return false;
                }
                ind = i + 1;
            } else if (cpt !== 0 && i === new_msg.length - 1) {
                return false;
            }
        }
        return true;
    }

    // Verification du segment
    function verifSegment(string) {
        var new_msg;
        var ind;
        var cpt;
        var i;
        if (string.charAt(0) !== "[" || string.charAt(string.length - 1) !== "]") {
            return false;
        }
        new_msg = string.slice(1, string.length - 1) + ",";
        ind = 0;
        cpt = 0;
        for (i = 0; i < new_msg.length; i += 1) {
            if (new_msg.charAt(i) === ",") {
                cpt += 1;
            }
            if (cpt === 2) {
                if (verifPoint(new_msg.slice(ind, i)) === false) {
                    return false;
                }
                cpt = 0;
                ind = i + 1;
            }
        }
        return true;
    }

    // Verification du point
    function verifPoint(string) {
        var new_msg;
        var i;
        if (string.charAt(0) !== "[" || string.charAt(string.length - 1) !== "]") {
            return false;
        }
        new_msg = string.slice(1, string.length - 1);
        for (i = 0; i < new_msg.length; i += 1) {
            if (new_msg.charAt(i) !== "," && new_msg.charAt(i) !== "." && window.isNaN(Number(new_msg.charAt(i)))) {
                return false;
            }
        }
        return true;
    }

// Algorithme de morphing

    // Met les tableaux aux indices passées en paramètre à la meme longueur
    function sameLength(m, n) {
        var ptrn1 = Model["pattern" + m];
        var ptrn2 = Model["pattern" + n];
        var segment;
        var length = Math.max(ptrn1.length, ptrn2.length);
        while (ptrn1.length < length) {
            segment = ptrn1[ptrn1.length - 1].clone();
            ptrn1.push(segment);
        }
        while (ptrn2.length < length) {
            segment = ptrn2[ptrn2.length - 1].clone();
            ptrn2.push(segment);
        }
    }

    // Affiche le prochain dessin (Clic sur le bouton Start ou Next)
    function showNextPattern() {
        var n = Object.keys(Model).length - 1;
        var next;
        if (n > 0 && fini) {
            if (index === null) {
                index = 0;
                repaint("pattern" + index);
            } else {
                next = (index + 1) % n;
                sameLength(index, next);
                Model.new = Model["pattern" + index].map((x) => x);
                fini = false;
                window.setTimeout(function display(alpha) {
                    Model.new = Model["pattern" + index].map(function (segment, ind) {
                        return segment.average(Model["pattern" + next][ind], alpha / 75);
                    });
                    repaint("new");
                    if (alpha < 75) {
                        window.setTimeout(display, 10, alpha + 1);
                    } else {
                        delete Model.new;
                        repaint("pattern" + next);
                        index = next;
                        fini = true;
                    }
                }, 10, 0);
            }
            document.getElementById("start").textContent = "NEXT";
        }
    }

    // Affiche le dessin précedent (Clic sur le bouton Undo)
    function showLastPattern() {
        var n = Object.keys(Model).length - 1;
        var last;
        if (n > 0 && fini && index !== null) {
            last = ((index - 1) % n + n) % n;
            sameLength(last, index);
            Model.new = Model["pattern" + index].map((x) => x);
            fini = false;
            window.setTimeout(function display(alpha) {
                Model.new = Model["pattern" + index].map(function (segment, ind) {
                    return segment.average(Model["pattern" + last][ind], alpha / 75);
                });
                repaint("new");
                if (alpha < 75) {
                    window.setTimeout(display, 10, alpha + 1);
                } else {
                    delete Model.new;
                    repaint("pattern" + last);
                    index = last;
                    fini = true;
                }
            }, 10, 0);
        }
    }

    // Affiche la symetrique horizontale du dessin (Clic sur Mirror-H)
    function showMirror_H() {
        var n = Object.keys(Model).length - 1;
        if (n > 0 && fini && index !== null) {
            Model.new = Model["pattern" + index].map((x) => x);
            Model.sym = Model["pattern" + index].map(function (segment) {
                return segment.horizontalSymmetry(canvas1.getAttribute("height") / 2);
            });
            fini = false;
            window.setTimeout(function display(alpha) {
                Model.new = Model["pattern" + index].map(function (segment, ind) {
                    return segment.average(Model.sym[ind], alpha / 75);
                });
                repaint("new");
                if (alpha < 75) {
                    window.setTimeout(display, 10, alpha + 1);
                } else {
                    Model["pattern" + index] = Model.sym;
                    delete Model.new;
                    delete Model.sym;
                    repaint("pattern" + index);
                    fini = true;
                }
            }, 10, 0);
        }
    }

    // Affiche la symetrique verticale du dessin (Clic sur Mirror-H)
    function showMirror_V() {
        var n = Object.keys(Model).length - 1;
        if (n > 0 && fini && index !== null) {
            Model.new = Model["pattern" + index].map((x) => x);
            Model.sym = Model["pattern" + index].map(function (segment) {
                return segment.verticalSymmetry(canvas1.getAttribute("width") / 2);
            });
            fini = false;
            window.setTimeout(function display(alpha) {
                Model.new = Model["pattern" + index].map(function (segment, ind) {
                    return segment.average(Model.sym[ind], alpha / 75);
                });
                repaint("new");
                if (alpha < 75) {
                    window.setTimeout(display, 10, alpha + 1);
                } else {
                    Model["pattern" + index] = Model.sym;
                    delete Model.new;
                    delete Model.sym;
                    repaint("pattern" + index);
                    fini = true;
                }
            }, 10, 0);
        }
    }

    // Arrête le morphing
    function stopShowing() {
        index = null;
        document.getElementById("start").textContent = "START";
        repaint("pattern" + index);
    }

// Ajout des ecouteurs d'évènements

    // Pour la création (clic gauche)
    canvas2.addEventListener("click", leftClick);

    // Pour revenir en arrière (tout sauf clic gauche)
    canvas2.addEventListener("auxclick", rightClick);

    // Appuie d'un bouton du clavier
    document.addEventListener("keydown", function (event) {
        if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
            canvas2.removeEventListener("click", leftClick);
            canvas2.addEventListener("click", newPolyline);
        } else if (event.code === "ControlLeft" || event.code === "ControlRight") {
            ctrlClicked = true;
        } else if (event.code === "KeyW" && ctrlClicked) {
            event.preventDefault();
            rightClick();
        } else if (event.code === "KeyG" && ctrlClicked) {
            event.preventDefault();
            symmetryEditorV();
        } else if (event.code === "KeyH" && ctrlClicked) {
            event.preventDefault();
            symmetryEditorH();
        } else if (event.code === "ArrowRight" && ctrlClicked) {
            event.preventDefault();
            showNextPattern();
        } else if (event.code === "ArrowLeft" && ctrlClicked) {
            event.preventDefault();
            showLastPattern();
        } else if (event.code === "ArrowUp" && ctrlClicked) {
            event.preventDefault();
            showMirror_V();
        } else if (event.code === "ArrowDown" && ctrlClicked) {
            event.preventDefault();
            showMirror_H();
        }
    });

    // Levé d'un bouton du clavier
    document.addEventListener("keyup", function (event) {
        if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
            canvas2.removeEventListener("click", newPolyline);
            canvas2.addEventListener("click", leftClick);
        } else if (event.code === "ControlLeft" || event.code === "ControlRight") {
            ctrlClicked = false;
        }
    });

    // Bouton Import
    document.getElementById("import").addEventListener("click", importEdition);

    // Bouton Export
    document.getElementById("export").addEventListener("click", exportEdition);

    // Bouton Display Area
    document.getElementById("display").addEventListener("click", displayArea);

    // Bouton Start
    document.getElementById("start").addEventListener("click", showNextPattern);

    // Bouton Last
    document.getElementById("last").addEventListener("click", showLastPattern);

    // Bouton Mirror-H
    document.getElementById("mirrorH").addEventListener("click", showMirror_H);

    // Bouton Mirror-V
    document.getElementById("mirrorV").addEventListener("click", showMirror_V);

    // Bouton Stop
    document.getElementById("stop").addEventListener("click", stopShowing);

    // Si le textarea est rouge
    document.getElementById("textarea").addEventListener("click", function () {
        this.style.backgroundColor = "white";
    });
});