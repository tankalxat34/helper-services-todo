

var userinput = document.querySelector("#user-input");
var p_nothing = document.querySelector("#task-field-nothing");
var p_completed_nothing = document.querySelector("#task-field-completed_nothing");

/**
 * How many symbols could be on the task's text
 */
const MAX_LENGTH = 100;


/**
 * Implementation of task field
 */
var TaskField = {
    /**
     * Place where new tasks will be show
     */
    DOM: document.querySelector("#task-field > #task-field-nothing"),

    /**
     * Place where completed tasks will be show
     */
    DOM_COMPLETED: document.querySelector("#task-field-completed > #task-field-completed_nothing"),

    /**
     * Field to count
     */
    DOM_FIELD_ACTUAL: document.querySelector("#task-field"),
    DOM_FIELD_COMPLETED: document.querySelector("#task-field-completed"),
    
    /**
     * Procedure to update all nesessary paramethers such as titles, headers, etc. This procedure should be called at the end of any CRUD function
     * @param {Boolean} scroll_status Set this as `true` when you need scroll to bottom page
     */
    _updateView: function (scroll_status = true) {
        if (this.count()) {
            p_nothing.style.display = "none";
            document.title = `(${this.count()} task${this.count() === 1 ? '' : 's'}) - ToDo Manager`;
        } else {
            p_nothing.style.display = "inherit";
            document.title = `You are free! - ToDo Manager`;
        }

        if (this.countCompleted()) {
            p_completed_nothing.style.display = "none";
        } else {
            p_completed_nothing.style.display = "inherit";
        }
        document.querySelector("#h2-actual_tasks").innerText = `Актуальные задачи (${this.count()})`;
        document.querySelector("#h2-completed_tasks").innerText = `Выполненные задачи (${this.countCompleted()})`;
        if (scroll_status) window.scrollTo(0, document.body.scrollHeight);
    },

    /**
     * Get all actual tasks
     * @returns Array
     */
    _getActualTasks: function () {
        return new Array(...document.querySelectorAll("#task-field > div.taskelem"));
    },

    /**
     * Get all completed tasks
     * @returns Array
     */
    _getCompletedTasks: function () {
        return new Array(...document.querySelectorAll("#task-field-completed > div.taskelem"));
    },

    /**
     * Return all tasks as DOM elements
     * @returns NodeListOf<Element>
     */
    getChilds: function () {
        return document.querySelectorAll("div.taskelem");
    },

    /**
     * Return the count of actual tasks
     * @returns Number
     */
    count: function () {
        return this.DOM_FIELD_ACTUAL.childElementCount - 1;
    },

    /**
     * Return the count of completeв tasks
     * @returns Number
     */
    countCompleted: function () {
        return this.DOM_FIELD_COMPLETED.childElementCount - 1;
    },


    /**
     * Remove task from field and `localStorage` by its id
     * @param {Number} task_id task's id
     */
    rm: function (task_id) {
        let task = document.querySelector(`div.taskelem[data-task_id="${task_id}"]`);

        if (task) {
            task.remove();
            localStorage.removeItem(task_id);
    
            this._updateView(false);
        }
    },

    /**
     * Fills the list of tasks from `localStorage`
     */
    fill: function () {
        if (Object.keys(localStorage).length) {

            for (const id of Object.keys(localStorage).sort()) {
                this.draw(localStorage.getItem(id), id, id > 0 ? this.DOM : this.DOM_COMPLETED);
            }
        }
    },

    /**
     * Draws the task in the task list
     * @param {String} task_text Task text
     * @param {Number} task_id Task identifier (usually time). Optional argument
     * @param {Element} DOM_field Field where needs to place the task
     */
    draw: function (task_text, task_id, DOM_field) {
        let TASK_ID = task_id || new Date().getTime();

        let div_keyboard = document.createElement("div");
        div_keyboard.classList = "task-keyboard close";

        if (DOM_field === TaskField.DOM) {
            let kb_complete = document.createElement("button");
            kb_complete.classList = "m0 keyboard_complete kbbutton btn";
            kb_complete.innerText = "✔";
            // kb_complete.style.fontSize = "10px";

            // kb_complete.style.margin = "20px 5px";
            kb_complete.addEventListener("click", () => this.complete(TASK_ID));
            div_keyboard.appendChild(kb_complete);
        } else {
            let kb_delete = document.createElement("button");
            kb_delete.classList = "m0 keyboard_delete kbbutton btn";
            kb_delete.innerText = "✖";
            // kb_delete.style.fontSize = "10px";
            // kb_delete.style.margin = "20px 5px";
            kb_delete.addEventListener("click", () => this.rm(TASK_ID));
            div_keyboard.appendChild(kb_delete);
        }


        let div_text = document.createElement("div");
        div_text.classList = "task-text";
        div_text.innerText = task_text;

        let div = document.createElement("div");
        div.setAttribute("data-task_id", TASK_ID);
        div.classList = "neu taskelem d-flex justify-content-between align-items-center";
        // div.innerHTML = `<p class="task-created_at" style="color: grey;">⏱ ${new Date(new Number(Math.abs(TASK_ID))).toLocaleDateString()} - ${new Date(new Number(Math.abs(TASK_ID))).toLocaleTimeString()}</p>`

        if (DOM_field === TaskField.DOM_COMPLETED) {
            div.classList.add("line-through");
        }

        div.appendChild(div_text);
        div.appendChild(div_keyboard);

        div.onselectionstart = () => false;

        div.addEventListener("dblclick", () => {
            if (TASK_ID > 0) {
                this.complete(TASK_ID);
            } else {
                this.rm(TASK_ID);
            }
        });

        div.addEventListener("mouseover", () => {
            div_keyboard.classList.remove("close");
        });

        div.addEventListener("mouseleave", () => {
            div_keyboard.classList.add("close");
        });

        if (DOM_field === this.DOM) {
            DOM_field.after(div);
        } else if (DOM_field === this.DOM_COMPLETED) {
            DOM_field.before(div);
        }
        this._updateView(false);

        return TASK_ID;
    },

    /**
     * Save task to local storage and draw it on field
     * @param {Number} task_id The task's id
     * @param {String} task_text The task's text
     * @param {Element} DOM_field Field where needs to place the task
     */
    saveToLocalStorage: function (task_id, task_text, DOM_field) {
        localStorage.setItem(this.draw(task_text, task_id, DOM_field), task_text);
    },

    /**
     * Get the number of the **first** task from actual or completed
     * @returns The number of the **first** task from actual or completed 
     */
    getFirstTaskId: function () {
        if (TaskField._getActualTasks().length) {
            return new Number((TaskField._getActualTasks().slice(0, 1)[0]).getAttribute("data-task_id"));
        } else {
            return new Number((TaskField._getCompletedTasks().slice(0, 1)[0]).getAttribute("data-task_id"));
        }
    },

    /**
     * Get the number of the **last** task from actual or completed
     * @returns The number of the **last** task from actual or completed 
     */
    getLastTaskId: function () {
        if (TaskField._getCompletedTasks().length) {
            return new Number((TaskField._getCompletedTasks().slice(TaskField._getCompletedTasks().length - 1)[0]).getAttribute("data-task_id"));
        } else {
            return new Number((TaskField._getActualTasks().slice(TaskField._getActualTasks().length - 1)[0]).getAttribute("data-task_id"));
        }
    },

    /**
     * Remove the first task from field
     */
    shift: function () {
        TaskField.rm(TaskField.getFirstTaskId());
    },
    
    /**
     * Remove the last task from field
    */
   pop: function () {
        TaskField.rm(TaskField.getLastTaskId());
    },

    /**
     * Mark the task as completed
     * @param {Number} task_id The task's id
     */
    complete: function (task_id) {
        let task_text = document.querySelector(`div.taskelem[data-task_id="${task_id}"] > div.task-text`);
        let task_kb_complete = document.querySelector(`div.taskelem[data-task_id="${task_id}"] > div.task-keyboard > button.keyboard_complete`);
        task_kb_complete.hidden = true;

        let completed_task_id = -task_id;
        this.rm(task_id);
        this.saveToLocalStorage(completed_task_id, task_text.innerText, this.DOM_COMPLETED);
    },

    /**
     * Create task by user's text: save it into local storage and draw it in the field
     */
    addByUserInput: function () {
        if (userinput.value && userinput.value.length <= MAX_LENGTH) {
            TaskField.saveToLocalStorage(new Date().getTime(), userinput.value, TaskField.DOM);
            userinput.value = new String();
        } else {
            alert(`You can't save empty task or your task has more than ${MAX_LENGTH} symbols`);
            userinput.value = new String();
        }
    },

    /**
     * Method to mark only even tasks
     */
    markOnlyEven: function () {
        let i = 0;
        TaskField.getChilds().forEach(el => {
            el.classList.remove("selection");
            if (i % 2 === 0) el.classList.add("selection");
            i++;
        });
    },

    /**
     * Method to mark only odd tasks
     */
    markOnlyOdd: function () {
        let i = 0;
        TaskField.getChilds().forEach(el => {
            el.classList.remove("selection");
            if (i % 2 != 0) el.classList.add("selection");
            i++;
        });
    },

    /**
     * Method to unmark all tasks
     */
    unmarkSelection: function () {
        TaskField.getChilds().forEach(el => {
            el.classList.remove("selection");
        });
    }
}



TaskField.fill();
TaskField._updateView();

window.onload = () => {
    document.querySelector("#button-addtolist").addEventListener("click", TaskField.addByUserInput);
}

userinput.addEventListener("keydown", (e) => {
    if (e.keyCode === 13) TaskField.addByUserInput();
})