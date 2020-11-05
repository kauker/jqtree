$(function(){
    const selectedOptions = {};

    $.get('json-sample.json', function(data) {
      console.log(data)
      data = transform(data);
      // console.log(data)
      renderTree(data);
    })

    function transform(obj) {
      return Object.keys(obj).map(function(key) {
        const result = obj[key];
        result['title'] = obj[key]['name'] + makeRadioButtons(obj[key]['term_id']);
        result['key'] = obj[key]['term_id'];
        if (obj[key]['children']) {
          obj[key]['children'] = transform(obj[key]['children'])
        }

        return result
      })
    }

    function makeRadioButtons(id) {
      return `<span class="options">
      <input name="opt-${id}" type="radio" value="1" ${selectedOptions[id] === '1' ? 'checked="true"' : ''}> 1
      <input name="opt-${id}" type="radio" value="2" ${selectedOptions[id] === '2' ? 'checked="true"' : ''}> 2
      <input name="opt-${id}" type="radio" value="3" ${selectedOptions[id] === '3' ? 'checked="true"' : ''}> 3
      </span>`
    }
    function renderTree(data) {
      // Attach the fancytree widget to an existing <div id="tree"> element
      // and pass the tree options as an argument to the fancytree() function:
      $("#tree").fancytree({
        extensions: ["dnd", "edit"],
        // titlesTabbable: true,
        source: data,
        dnd: {
          autoExpandMS: 400,
          focusOnClick: true,
          preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.
          preventRecursiveMoves: true, // Prevent dropping nodes on own descendants
          dragStart: function(node, data) {
            /** This function MUST be defined to enable dragging for the tree.
             *  Return false to cancel dragging of node.
             */
            if (data.otherNode.data.move === 'fixed') {
              return false
            }
            return true;
          },
          dragEnter: function(node, data) {
            /** data.otherNode may be null for non-fancytree droppables.
             *  Return false to disallow dropping on node. In this case
             *  dragOver and dragLeave are not called.
             *  Return 'over', 'before, or 'after' to force a hitMode.
             *  Return ['before', 'after'] to restrict available hitModes.
             *  Any other return value will calc the hitMode from the cursor position.
             */
            // Prevent dropping a parent below another parent (only sort
            // nodes under the same parent)
  /*           if(node.parent !== data.otherNode.parent){
              return false;
            }
            // Don't allow dropping *over* a node (would create a child)
            return ["before", "after"];
  */
            return true;
          },
          dragDrop: function(node, data) {
            /** This function MUST be defined to enable dropping of items on
             *  the tree.
             */
            data.otherNode.moveTo(node, data.hitMode);

            makeRequest({
              nodeId: data.otherNode.data.term_id,
              parentId: data.otherNode.parent.data.term_id,
              selectedOption: selectedOptions[data.otherNode.data.term_id]
            })
            const value = selectedOptions[data.otherNode.data.term_id];
            
            if (value) {
              $(data.otherNode.li).find("input[value=" + value + "]").prop('checked', true);
            }
          }
        },
        activate: function(event, data) {
  //        alert("activate " + data.node);
        }
      });
    }

    function makeRequest(data) {
      // simulating request ot backend api
      // $.ajax()...
      $('#log').prepend(`<p>${JSON.stringify(data)}</p>`)
    }

    $(document.body).on('click', "input:radio", function(e) {
      
      const node = $.ui.fancytree.getNode(e);
      const parentId = node.parent.data.term_id;
      const id = e.target.getAttribute('name').split('-')[1];
      selectedOptions[id] = e.target.value;
      makeRequest({
        nodeId: id,
        parentId: parentId,
        selectedOption: selectedOptions[id]
      })
    })
});