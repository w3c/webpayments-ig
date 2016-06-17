/* Web Payments Community Group common spec JavaScript */
var opencreds = {
  // Add as the respecConfig localBiblio variable
  // Extend or override global respec references
  localBiblio: {
    "CCG-USE-CASES": {
      title: "Credentials Use Cases",
      date: "2016",
      href: "http://www.opencreds.org/specs/source/use-cases/",
      authors: [
        "Lee, Sunny",
        "Otto, Nate"
      ],
      publisher: "W3C Credentials Community Group"
    },
    "REST": {
      title: "Architectural Styles and the Design of Network-based Software Architectures",
      date: "2000",
      href: "http://www.ics.uci.edu/~fielding/pubs/dissertation/",
      authors: [
        "Fielding, Roy Thomas"
      ],
      publisher: "University of California, Irvine."
    },
    "SECURE-MESSAGING": {
      title: "Secure Messaging",
      href: "https://web-payments.org/specs/source/secure-messaging",
      authors: [
        "Manu Sporny"
      ],
      etal: true,
      // FIXME: add CG-DRAFT status and publisher support to respec
      status: "unofficial",
      publisher: "Web Payments Community Group"
    },
    // aliases to known references
    "HTTP-SIGNATURES": {
      aliasOf: "http-signatures"
    },
    "MACAROONS": {
      title: 'Macaroons',
      // TODO: create spec
      href: 'http://macaroons.io/',
      authors: ['Arnar Birgisson', 'Joe Gibbs Politz', 'Úlfar Erlingsson',
        'Ankur Taly', 'Michael Vrable', 'Mark Lentczner'],
      status: 'unofficial',
      publisher: 'Credentials Community Group'
    },
    'CREDENTIAL-MANAGEMENT': {
      title: 'Credential Management Level 1',
      href: 'https://w3c.github.io/webappsec-credential-management/',
      authors: ['Mike West'],
      status: 'WG-DRAFT',
      publisher: 'Web Application Security Working Group'
    },
    'OPEN-BADGES': {
      title: 'Open Badges',
      href: 'https://github.com/openbadges/openbadges-specification',
      authors: ['Brian Brennan', 'Mike Larsson', 'Chris McAvoy',
        'Nate Otto', 'Kerri Lemoie'],
      status:   'BA-DRAFT',
      publisher:  'Badge Alliance Standard Working Group'
    },
    'IDENTITY-CREDENTIALS': {
      title: 'Identity Credentials',
      href: 'http://opencreds.org/specs/source/identity-credentials/',
      authors: ['Manu Sporny', 'Dave Longley'],
      status:   'CG-DRAFT',
      publisher:  'W3C Credentials Community Group'
    },
    'RDF-NORMALIZATION': {
      title: 'RDF Dataset Normalization',
      href: 'http://json-ld.github.io/normalization/spec/',
      authors: ['Dave Longley', 'Manu Sporny'],
      status:   'CG-DRAFT',
      publisher:  'Credentials W3C Community Group'
    },
    'WEB-COMMERCE': {
      title: 'Web Commerce',
      href: 'https://web-payments.org/specs/source/web-commerce/',
      authors: ['Dave Longley', 'Manu Sporny', 'David I. Lehn'],
      status:   'CG-DRAFT',
      publisher:  'W3C Credentials Community Group'
    },
    'WEB-COMMERCE-API': {
      title: 'Web Commerce API',
      href: 'https://web-payments.org/specs/source/web-commerce-api/',
      authors: ['Manu Sporny', 'Dave Longley', 'David I. Lehn'],
      status:   'CG-DRAFT',
      publisher:  'W3C Credentials Community Group'
    }
  }
};



// We should be able to remove terms that are not actually
// referenced from the common definitions
//
// the termlist is in a block of class "termlist", so make sure that
// has an ID and put that ID into the termLists array so we can 
// interrogate all of the included termlists later.
var termNames = [] ;
var termLists = [] ;
var termsReferencedByTerms = [] ;

function restrictReferences(utils, content) {
    var base = document.createElement("div");
    base.innerHTML = content;

    // New new logic:
    //
    // 1. build a list of all term-internal references
    // 2. When ready to process, for each reference INTO the terms, 
    // remove any terms they reference from the termNames array too.
    $.each(base.querySelectorAll("dfn"), function(i, item) {
        var $t = $(item) ;
        var titles = $t.getDfnTitles();
        var n = $t.makeID("dfn", titles[0]);
        if (n) {
            termNames[n] = $t.parent() ;
        }
    });

    var $container = $(".termlist",base) ;
    var containerID = $container.makeID("", "terms") ;
    termLists.push(containerID) ;

    // add a handler to come in after all the definitions are resolved
    //
    // New logic: If the reference is within a 'dl' element of
    // class 'termlist', and if the target of that reference is
    // also within a 'dl' element of class 'termlist', then
    // consider it an internal reference and ignore it.

    return (base.innerHTML);
}

require(["core/pubsubhub"], function(respecEvents) {
    "use strict";
    respecEvents.sub('end', function(message) {
        if (message == 'core/link-to-dfn') {
            // all definitions are linked; find any internal references
            $(".termlist a.internalDFN").each(function() {
                var $r = $(this);
                var id = $r.attr('href');
                var idref = id.replace(/^#/,"") ;
                if (termNames[idref]) {
                    // this is a reference to another term
                    // what is the idref of THIS term?
                    var $def = $r.closest('dd') ;
                    if ($def.length) {
                        var $p = $def.prev('dt').find('dfn') ;
                        var tid = $p.attr('id') ;
                        if (tid) {
                            if (termsReferencedByTerms[tid]) {
                                termsReferencedByTerms[tid].push(idref);
                            } else {
                                termsReferencedByTerms[tid] = [] ;
                                termsReferencedByTerms[tid].push(idref);
                            }
                        }
                    }
                }
            }) ;

            // clearRefs is recursive.  Walk down the tree of 
            // references to ensure that all references are resolved.
            var clearRefs = function(theTerm) {
                if ( termsReferencedByTerms[theTerm] ) {
                    $.each(termsReferencedByTerms[theTerm], function(i, item) {
                        if (termNames[item]) {
                            delete termNames[item];
                            clearRefs(item);
                        }
                    });
                }
                // make sure this term doesn't get removed
                if (termNames[theTerm]) {
                    delete termNames[theTerm];
                }
            };
           
            // now termsReferencedByTerms has ALL terms that 
            // reference other terms, and a list of the 
            // terms that they reference
            $("a.internalDFN").each(function () {
                var $item = $(this) ;
                var t = $item.attr('href');
                var r = t.replace(/^#/,"") ;
                // if the item is outside the term list
                if ( ! $item.closest('dl.termlist').length ) {
                    clearRefs(r);
                }
            });

            // delete any terms that were not referenced.
            Object.keys(termNames).forEach(function(term) {
                var $p = $("#"+term) ;
                if ($p) {
                    var tList = $p.getDfnTitles();
                    $p.parent().next().remove();
                    $p.remove() ;
                    tList.forEach(function( item ) {
                        if (respecConfig.definitionMap[item]) {
                            delete respecConfig.definitionMap[item];
                        }
                    });
                }
            });
        }
    });
});
