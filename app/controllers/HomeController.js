/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var HomeController = {
    index: function(req, res) {
        res.render('index', {
            title: 'Oryx'
        });
    }
};

module.exports = HomeController;