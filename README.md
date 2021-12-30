# js-webgl-2d-polygon-interpolator

Repositório para o primeiro trabalho da matéria de Computação Gráfica do Mestrado Strictu Sensu da Universidade Federal Fluminense.
 
Este trabalho calcula e imprime na tela a transformação (morphing) entre dois polígonos fechados, cada um deles sendo descritos como uma coleção de vértices no espaço [-1, 1]. A transformação entre as formas é sempre linear. Atualmente, as formas que servem de base (“origem”) e destino podem ter números diferentes de vértices.
 
**Para executar o código**, deve-se baixar os dois arquivos (tanto o morpher.js quanto o index.html), colocar os dois no mesmo diretório e abrir o arquivo .html. Lá, você terá acesso a duas formas definidas no código de morpher.js, um botão de play que toca a animação de transformação e um controlador de velocidade da animação.
 
A animação roda a cada chamada de draw(), atualizando sempre a valor escalar de velocidade vezes o espaço de tempo entre uma chamada e outra da função draw(). A velocidade de animação também pode variar conforme o número de polígonos intermediários calculados (i.e. o número de frames da animação), que é controlado por uma variável dentro do arquivo .js.
 
A correspondência entre vértices dos dois polígonos é feita de forma completamente manual. Isto é, os vértices de origem e destino têm a correspondência feita conforme a ordem de declaração dos vértices de cada polígono. Dependendo do polígono, isso pode causar transformações pouco intuitivas. 
 
O código possui um modo “automático” de fazer essa correspondência, atribuindo os vértices de destino aos vértices de origem através de proximidade. No atual estado, esse modo é pouco funcional uma vez que, ao final da operação, nem sempre as arestas da transformação corresponderão às arestas do polígono destino. Alternar entre os dois modos pode ser feito na chamada da função INTERPOLATOR.calculateFrames(), trocando entre “DistanceMethod.AUTO” e “DistanceMethod.MANUAL”.
 
morpher.js conta com uma coleção de classes:
    * classe COLOR, para armazenar cores que podem ser usadas por vértices;
    * classe VERTEX, para armazenar informações de vértices individuais;
    * classe POLYGON, para armazenar a coleção de vértices que compõe um polígono;
    * classe INTERPOLATOR, para calcular as formas que uma forma assume ao ser transformada em outra e guardar essa informação em um dicionário;
    * classe speedbutton, para fazer a manipulação da velocidade da animação através da GUI.
 
morpher.js também conta com uma coleção de funções:
    * calculateVertexDistance(vertex1, vertex2)
        * Retorna a distância entre dois vértices passados como parâmetro;
    * getShader(id)
        * Encontra, compila e retorna um shader declarado em GLSL que contenha o id passado como parâmetro; acontece no carregamento da página
    * initProgram()
        * Prepara a inicialização do programa, atribuindo os shaders apropriados para as variáveis apropriadas; acontece no carregamento de página
    * initBuffers()
        * Inicializa os buffers necessários, incluindo alocação de espaço para os polígonos necessários (o polígono de origem, o polígono de destino e o polígono que se transforma, um frame de cada vez) aparecerem na tela; acontece no carregamento da página
    * draw()
        * desenha o frame atual, atualizando os frames apropriados para animar a transformação;
    * createGUI()
        * Cria a GUI, com um botão de tocar/pausar e o controlador de velocidade
    * render()
        * Renderiza a tela, fazendo a chamada da função draw()
    * init()
        * Inicializa o canvas WebGL, criando também os elementos da GUI, inicializando o programa, os buffers e mandando renderizar o primeiro frame
 
TO-DO:
    * Consertar o “modo auto” (descrito acima) para realizar a transformação respeitando as arestas da forma pretendida;
        * A tese http://www2.inf.uos.de/prakt/pers/dipl/svalbrec/thesis.pdf oferece uma solução para esse problema, na forma de saltos na hora de fazer a correspondência entre vértices;
    * Repensar a interface para permitir alteração de polígonos e da forma de calcular correspondências sem precisar alterar o código e recarregar a página;

***

Repository for the first assignment in the Computer Graphics subject of the Strictu Sensu Master's Degree at Universidade Federal Fluminense.
 
This assignment calculates and prints on screen the transformation (morphing) between two closed polygons, each one being described as a collection of vertices in space [-1, 1]. The morphing between shapes is always linear. Currently, the shapes that serve as base (“origin”) and destination can have different numbers of vertices.  
 
**To run the code**, you must download both files (both morpher.js and index.html), place them in the same directory and open the .html file. There you will have access to two shapes defined in the morpher.js code, a play button that plays the morphing animation and an animation speed controller.  
 
The animation runs on each draw() function call at a rate equal to a scalar value named "speed" times the amount of time between each draw() function call. The animation speed can also vary depending on the number of intermediate polygons calculated (i.e. the number of frames of the animation), which is controlled by a variable within the .js file.  
 
The correspondence between vertices of the two polygons is done completely manually. That is, the source and destination vertices are matched according to the order of declaration of the vertices of each polygon. Depending on the polygon, this can cause unintuitive transformations.  
 
The code has an “automatic” way of making this correspondence, assigning the source vertices to the destination vertices through proximity. In its current state, this mode is barely functional since that, at the end of the operation, the edges of the transformation will not always match the edges of the target polygon. Switching between the two modes can be done at the INTERPOLATOR.calculateFrames() function call, switching between “DistanceMethod.AUTO” and “DistanceMethod.MANUAL”.  
 
morpher.js has a collection of classes:
    * COLOR class, to store colors that can be used by vertices;  
    * VERTEX class, to store information on individual vertices;  
    * POLYGON class, to store the collection of vertices that compose a polygon;  
    * INTERPOLATOR class, to calculate the forms that a shape takes when being transformed into another and store this information in a dictionary;  
    * speedbutton class, to handle the animation speed through the GUI.  
 
morpher.js also has a collection of functions:

    * 'calculateVertexDistance(vertex1, vertex2)' Returns the distance between two vertices passed as a parameter;  
    * 'getShader(id)' Find, compile and return a shader declared in GLSL that contains the id passed as a parameter; happens on page load;  
    * 'initProgram()' Prepares program startup, assigning the appropriate shaders to the appropriate variables; happens when the page first loads;  
    * 'initBuffers()' Initializes the necessary buffers, including space allocation for necessary polygons (the origin, the destination and the morphing, showing one frame at a time) to show on screen; happens when the page first loads;  
    * 'draw()' draws the current frame, updating the appropriate frames to animate the transformation;  
    * 'createGUI()' Creates the GUI, with a play/pause button and speed controller;  
    * 'render()' Renders the screen, calling the draw() function;  
    * 'init()' Initializes the WebGL canvas, also creating the GUI elements, initializing the program, the buffers and having the first frame render.  
 
TO-DO:
    * Fix the “auto mode” (described above) to carry out the transformation respecting the edges as desired;  
        * The thesis http://www2.inf.uos.de/prakt/pers/dipl/svalbrec/thesis.pdf offers a solution to this problem, in the form of skips when making the correspondence between vertices;  
    * Rethink the interface to allow changing polygons and the way to calculate matches without having to change the code and reload the page;   
